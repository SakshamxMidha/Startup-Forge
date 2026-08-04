import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import prisma from './lib/prisma';
import authRouter from './routes/auth';
import meRouter from './routes/me';
import startupsRouter from './routes/startups';
import { embedText } from './services/embeddings';

const app = express();

// FRONTEND_URL supports a comma-separated list (e.g. the deployed Cloudflare Pages URL
// plus http://localhost:5173 for local dev). Left unset, we allow all origins so local
// dev keeps working without extra setup — set it once the production frontend URL is known.
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim())
  : null;

app.use(cors({
  origin: (origin, callback) => {
    if (!allowedOrigins || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/', meRouter);
app.use('/startups', startupsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/test-db', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
});