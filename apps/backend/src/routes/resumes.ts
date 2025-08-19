import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import { uploadObject, createSignedUrl } from '../lib/s3';

export const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', authMiddleware, upload.single('file'), async (req, res) => {
  const user = (req as any).user as { id: string };
  const file = req.file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const bucket = process.env.S3_BUCKET || 'obar';
  const objectKey = `resumes/${user.id}/${Date.now()}-${file.originalname}`;
  await uploadObject(bucket, objectKey, file.buffer, file.mimetype);
  const created = await prisma.resume.create({ data: { userId: user.id, filename: file.originalname, mimetype: file.mimetype, size: file.size, objectKey } });
  const url = await createSignedUrl(bucket, objectKey, 3600);
  res.status(201).json({ ...created, url });
});

router.post('/:id/parse', authMiddleware, async (req, res) => {
  const bucket = process.env.S3_BUCKET || 'obar';
  const resume = await prisma.resume.findUnique({ where: { id: req.params.id } });
  if (!resume) return res.status(404).json({ error: 'Not found' });
  // Download via signed URL and parse if PDF
  const url = await createSignedUrl(bucket, resume.objectKey, 300);
  let skills = '';
  let summary = '';
  try {
    if (resume.mimetype === 'application/pdf') {
      const resp = await fetch(url);
      const buf = Buffer.from(await resp.arrayBuffer());
      const pdfData = await pdfParse(buf);
      const text = (pdfData.text || '').toLowerCase();
      const skillList = ['javascript','typescript','react','node','python','java','sql'];
      skills = skillList.filter(s => text.includes(s)).join(',');
      summary = (pdfData.info?.Title as string) || 'Parsed resume';
    }
  } catch {}
  const parsed = await prisma.resumeParseResult.upsert({
    where: { resumeId: resume.id },
    update: { skillsCsv: skills || null, summary: summary || null },
    create: { resumeId: resume.id, skillsCsv: skills || null, summary: summary || null }
  });
  res.json(parsed);
});

