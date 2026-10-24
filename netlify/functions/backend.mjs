/**
 * Netlify Function: backend.mjs
 * Secure server-side proxy between frontend and Google Apps Script Web App.
 * Injects FREEZER_API_KEY and protects endpoint with user PIN validation.
 */

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbzEQwQDjQFbUTz1z8DpNVKQIpoX8oG2HSDKPkzXElLFmTz9SMxO1jIZr1p0jZH_vWyL/exec';

export default async (request, context) => {
  // Handle CORS preflight if needed
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-user-pin, Authorization',
      },
    });
  }

  const configuredUserPin =
    process.env.FREEZER_USER_PIN || process.env.APP_ACCESS_PIN || '1234';

  // Validate single-user security PIN
  const clientPin =
    request.headers.get('x-user-pin') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (configuredUserPin && clientPin !== configuredUserPin) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Acceso no autorizado: PIN de seguridad inválido o no suministrado.',
        code: 'UNAUTHORIZED',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const gasUrl = process.env.GAS_URL || DEFAULT_GAS_URL;
  const apiKey = process.env.FREEZER_API_KEY || '';

  try {
    const incomingUrl = new URL(request.url);
    const targetUrl = new URL(gasUrl);

    // Copy incoming query params to GAS URL
    incomingUrl.searchParams.forEach((val, key) => {
      targetUrl.searchParams.set(key, val);
    });

    // Add secret API key to query params
    if (apiKey) {
      targetUrl.searchParams.set('key', apiKey);
      targetUrl.searchParams.set('apiKey', apiKey);
    }

    let responseFromGas;

    if (request.method === 'GET') {
      responseFromGas = await fetch(targetUrl.toString(), {
        method: 'GET',
        redirect: 'follow',
        headers: {
          Accept: 'application/json, text/plain, */*',
        },
      });
    } else if (request.method === 'POST') {
      let bodyData = {};
      try {
        const rawText = await request.text();
        if (rawText) {
          bodyData = JSON.parse(rawText);
        }
      } catch (err) {
        bodyData = {};
      }

      // Inject API key into payload as well
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
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // If Apps Script returned HTML error or non-JSON string
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
  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: `Error de conexión con el backend: ${error?.message || error}`,
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
