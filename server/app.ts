import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import contactsRoutes from './routes/contacts';
import { errorHandler } from './middleware/error';

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://lovetalk.cyou', 'https://www.lovetalk.cyou', 'https://love-talk.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// General rate limit: 100 requests per minute
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Login rate limit: 5 requests per minute
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', loginLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '3.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);

// Error handler
app.use(errorHandler);

export default app;
