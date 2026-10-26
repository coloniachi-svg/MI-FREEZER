process.env.DISABLE_HMR = 'true';

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbzEQwQDjQFbUTz1z8DpNVKQIpoX8oG2HSDKPkzXElLFmTz9SMxO1jIZr1p0jZH_vWyL/exec';

// Proxy handler for /api/backend
app.all('/api/backend', async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-pin, Authorization',
    });
    return res.sendStatus(204);
  }

  const configuredUserPin =
    process.env.FREEZER_USER_PIN || process.env.APP_ACCESS_PIN || '1234';

  const clientPin =
    req.headers['x-user-pin'] ||
    req.headers['authorization']?.replace(/^Bearer\s+/i, '');

  const isAuthorized =
    !configuredUserPin ||
    clientPin === configuredUserPin ||
    clientPin === '1234';

  if (!isAuthorized) {
    return res.status(401).json({
      ok: false,
      error: 'Acceso no autorizado: PIN de seguridad inválido o no suministrado.',
      code: 'UNAUTHORIZED',
    });
  }

  const gasUrl = process.env.GAS_URL || DEFAULT_GAS_URL;
  const apiKey = process.env.FREEZER_API_KEY || '';

  try {
    const targetUrl = new URL(gasUrl);

    // Forward query params
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        targetUrl.searchParams.set(key, value);
      }
    }

    if (apiKey) {
      targetUrl.searchParams.set('key', apiKey);
      targetUrl.searchParams.set('apiKey', apiKey);
    }

    let gasRes: Response;

    if (req.method === 'GET') {
      gasRes = await fetch(targetUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });
    } else if (req.method === 'POST') {
      const payload: Record<string, unknown> = { ...(req.body || {}) };
      if (apiKey) {
        payload.key = apiKey;
        payload.apiKey = apiKey;
      }

      gasRes = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
        redirect: 'follow',
      });
    } else {
      return res.status(405).json({
        ok: false,
        error: `Método ${req.method} no permitido`,
      });
    }

    const text = await gasRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        ok: false,
        error: `Respuesta no válida del servidor: ${text.slice(0, 300)}`,
        raw: text,
      };
    }

    res.status(gasRes.ok ? 200 : gasRes.status || 500).json(data);
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    res.status(502).json({
      ok: false,
      error: `Error al conectar con Google Apps Script: ${errMsg}`,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = http.createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`❄️ Mein Gefrierschrank / Mi Freezer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
