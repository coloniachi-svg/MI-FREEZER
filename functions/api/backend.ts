/**
 * Cloudflare Pages Function & Cloudflare Worker Handler for /api/backend
 * Secure server-side proxy between frontend and Google Apps Script Web App.
 * Injects FREEZER_API_KEY on the server side without exposing secrets.
 */

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbzEQwQDjQFbUTz1z8DpNVKQIpoX8oG2HSDKPkzXElLFmTz9SMxO1jIZr1p0jZH_vWyL/exec';

export interface Env {
  GAS_URL?: string;
  FREEZER_API_KEY?: string;
  ASSETS?: { fetch: (req: Request) => Promise<Response> };
}

/**
 * Executes fetch to Google Apps Script manually handling 302/307 redirects
 * to preserve the HTTP method (POST) and body payload.
 */
async function fetchGasWithRedirect(
  targetUrl: string,
  method: 'GET' | 'POST',
  bodyData?: Record<string, unknown>
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/json, text/plain, */*',
  };

  const options: RequestInit = {
    method,
    headers,
    redirect: 'manual',
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(bodyData || {});
  }

  let res = await fetch(targetUrl, options);

  let redirectCount = 0;
  while ([301, 302, 303, 307, 308].includes(res.status) && redirectCount < 5) {
    redirectCount++;
    const location = res.headers.get('location');
    if (!location) break;

    const nextUrl = new URL(location, targetUrl).toString();

    // Preserve POST method and body when following Apps Script redirects
    const nextOptions: RequestInit = {
      method,
      headers: { ...headers },
      redirect: 'manual',
    };
    if (method === 'POST') {
      nextOptions.body = JSON.stringify(bodyData || {});
    }

    res = await fetch(nextUrl, nextOptions);
  }

  return res;
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

  const rawGasUrl = env.GAS_URL || DEFAULT_GAS_URL;
  const gasUrl = rawGasUrl.trim().replace(/["']/g, '');
  const apiKey = (env.FREEZER_API_KEY || '').trim().replace(/["']/g, '');

  try {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(gasUrl);

    // Copy incoming query params to GAS URL
    incomingUrl.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });

    // Inject secret API key if provided
    if (apiKey) {
      targetUrl.searchParams.set('key', apiKey);
      targetUrl.searchParams.set('apiKey', apiKey);
    }

    let responseFromGas: Response;

    if (request.method === 'GET') {
      responseFromGas = await fetchGasWithRedirect(targetUrl.toString(), 'GET');
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

      if (apiKey) {
        bodyData.key = apiKey;
        bodyData.apiKey = apiKey;
      }

      responseFromGas = await fetchGasWithRedirect(targetUrl.toString(), 'POST', bodyData);
    } else {
      return new Response(
        JSON.stringify({ ok: false, error: `Método ${request.method} no permitido.` }),
        {
          status: 405,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
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
        raw: responseText.slice(0, 300),
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
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
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
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    // Handle API requests to /api/backend
    if (pathname === '/api/backend' || pathname.startsWith('/api/backend/')) {
      return handleBackendProxy(request, env);
    }

    // Serve static assets / SPA fallback via ASSETS binding
    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) {
        return assetRes;
      }
      // SPA Fallback for client-side navigation (e.g., /inventario -> /index.html)
      const indexReq = new Request(new URL('/index.html', request.url), request);
      return env.ASSETS.fetch(indexReq);
    }

    return new Response('Not found', { status: 404 });
  },
};
