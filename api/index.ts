// Granular diagnostics: test each import step-by-step

const diagnostics: Array<{ step: string; ok: boolean; error?: string }> = [];

async function tryImport(path: string, step: string): Promise<any> {
  try {
    const mod = await import(path);
    diagnostics.push({ step, ok: true });
    return mod;
  } catch (err: any) {
    const msg = err?.message || err?.toString?.() || String(err);
    diagnostics.push({ step, ok: false, error: msg });
    throw err;
  }
}

let app: any;

try {
  await tryImport('express', 'import express');
  await tryImport('cors', 'import cors');
  await tryImport('cookie-parser', 'import cookie-parser');
  await tryImport('express-rate-limit', 'import express-rate-limit');
  await tryImport('bcryptjs', 'import bcryptjs');
  await tryImport('jsonwebtoken', 'import jsonwebtoken');
  await tryImport('@prisma/client', 'import @prisma/client');
  const mod = await tryImport('../server/app', 'import server/app');
  app = mod.default;
} catch (_err: any) {
  // one of them failed — app stays undefined
}

export default function handler(req: any, res: any) {
  if (app) {
    return app(req, res);
  }
  res.status(500).json({
    error: 'Server startup failed',
    diagnostics,
    env: {
      node_env: process.env.NODE_ENV,
      database_url_set: !!process.env.DATABASE_URL,
      jwt_secret_set: !!process.env.JWT_SECRET,
    },
  });
}
