import 'dotenv/config';
import express from 'express';
import prisma from './lib/prisma';
import authRouter from './routes/auth';
import meRouter from './routes/me';

const app = express();
app.use(express.json());

app.use('/auth', authRouter);
app.use('/', meRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 4000;

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