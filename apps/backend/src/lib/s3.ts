import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
const accessKeyId = process.env.S3_ACCESS_KEY || 'minioadmin';
const secretAccessKey = process.env.S3_SECRET_KEY || 'minioadmin';
const region = 'us-east-1';
const forcePathStyle = true;

export const s3 = new S3Client({
  endpoint,
  region,
  forcePathStyle,
  credentials: { accessKeyId, secretAccessKey }
});

export async function uploadObject(bucket: string, key: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
}

export async function createSignedUrl(bucket: string, key: string, expiresIn = 3600) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}

