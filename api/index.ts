// Diagnostic wrapper: catch startup errors and return them as JSON
// so we can see what's failing instead of getting FUNCTION_INVOCATION_FAILED

let handler: any;

try {
  handler = (await import('../server/app')).default;
} catch (startupErr: any) {
  const detail = startupErr?.message || String(startupErr);
  const stack = startupErr?.stack || '';
  console.error('[STARTUP ERROR]', detail, stack);
  handler = (_req: any, res: any) => {
    res.status(500).json({
      error: 'Server startup failed',
      detail,
      stack: stack.split('\n').slice(0, 10),
      hint: 'Check Vercel Build Logs for prisma generate / migrate deploy output',
    });
  };
}

export default handler;
