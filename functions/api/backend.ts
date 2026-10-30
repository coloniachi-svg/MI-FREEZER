/**
 * Cloudflare Pages Function & Cloudflare Worker Handler for /api/backend
 * Secure server-side proxy between frontend and Google Apps Script Web App.
 * Injects FREEZER_API_KEY on the server side without exposing it to the client.
 */

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbzEQwQDjQFbUTz1z8DpNVKQIpoX8oG2HSDKPkzXElLFmTz9SMxO1jIZr1p0jZH_vWyL/exec';

export interface Env {
  GAS_URL?: string;
  FREEZER_API_KEY?: string;
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
}

export async function handleBackendProxy(request: Request, env: Env): Promise<Response> {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const gasUrl = env.GAS_URL || DEFAULT_GAS_URL;
  const apiKey = env.FREEZER_API_KEY || '';

  try {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(gasUrl);

    // Copy incoming query params to GAS URL
    incomingUrl.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });

    // Add secret API key to query params if available
    if (apiKey) {
      targetUrl.searchParams.set('key', apiKey);
      targetUrl.searchParams.set('apiKey', apiKey);
    }

    let responseFromGas: Response;

    if (request.method === 'GET') {
      responseFromGas = await fetch(targetUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });
    } else if (request.method === 'POST') {
      let bodyData: Record<string, unknown> = {};
      try {
        const rawText = await request.text();
        if (rawText) {
          bodyData = JSON.parse(rawText);
        }
      } catch {
        bodyData = {};
      }

      // Inject API key into payload if available
      if (apiKey) {
        bodyData.key = apiKey;
        bodyData.apiKey = apiKey;
      }

      responseFromGas = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(bodyData),
        redirect: 'follow',
      });
    } else {
      return new Response(
        JSON.stringify({ ok: false, error: `Método ${request.method} no permitido.` }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const responseText = await responseFromGas.text();
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        ok: false,
        error: `Respuesta no válida del servidor: ${responseText.slice(0, 300)}`,
        raw: responseText,
      };
    }

    return new Response(JSON.stringify(parsedData), {
      status: responseFromGas.ok ? 200 : responseFromGas.status || 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: `Error de conexión con el backend: ${errMsg}`,
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handler for Cloudflare Pages Functions
export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  return handleBackendProxy(context.request, context.env);
}

// Handler for Cloudflare Workers (wrangler deploy with ASSETS binding)
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/backend' || url.pathname.startsWith('/api/backend')) {
      return handleBackendProxy(request, env);
    }
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  },
};
