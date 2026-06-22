import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import contactsRoutes from './routes/contacts';
import { errorHandler } from './middleware/error';

const app = express();

// Allow all origins in development, specific origins in production
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      'https://lovetalk.cyou',
      'https://www.lovetalk.cyou',
      'https://love-talk.vercel.app',
      'https://love-talk-git-main.vercel.app',
    ]
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true); // Temporarily allow all during debugging
  },
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
  res.json({ status: 'ok', version: '3.0.0', env: process.env.NODE_ENV });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);

// Error handler
app.use(errorHandler);

export default app;
