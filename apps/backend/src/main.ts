import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { router as healthRouter } from './routes/health';
import { router as authRouter } from './routes/auth';
import { router as jobsRouter } from './routes/jobs';
import { router as applicationsRouter } from './routes/applications';
import { router as coursesRouter } from './routes/courses';
import { router as resumesRouter } from './routes/resumes';
import { router as adminRouter } from './routes/admin';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: '*', credentials: false }));
app.use(morgan('dev'));

app.get('/', (_req: Request, res: Response) => {
  res.json({ name: 'obar-backend', status: 'ok' });
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/jobs', jobsRouter);
app.use('/applications', applicationsRouter);
app.use('/courses', coursesRouter);
app.use('/resumes', resumesRouter);
app.use('/admin', adminRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening at http://0.0.0.0:${port}`);
});

