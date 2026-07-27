import app from '../server/app';

// Vercel serverless function — directly export Express app
// serverless-http is NOT compatible with Vercel's (req, res) signature
export default app;
