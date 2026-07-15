export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = ['https://moddable.games', 'https://www.moddable.games'];
    const allowed = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': allowed,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return respond(405, { error: 'Method not allowed' }, corsHeaders);
    }

    const path = url.pathname.replace(/\/$/, '');

if (path === '/api/subscribe') {
      return handleSubscribe(request, env, corsHeaders);
    }

    if (path === '/api/submit') {
      return handleSubmit(request, env, corsHeaders);
    }

    return respond(404, { error: 'Not found' }, corsHeaders);
  }
};

async function handleSubscribe(request, env, corsHeaders) {
  const data = await parseBody(request);
  if (!data) return respond(400, { error: 'Invalid request body' }, corsHeaders);

  const email = (data.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    return respond(400, { error: 'Valid email required' }, corsHeaders);
  }

  const entry = {
    email,
    subscribedAt: new Date().toISOString(),
    source: data.source || 'website',
  };

  try {
    await env.STORE.put(`sub:${email}`, JSON.stringify(entry));
  } catch (err) {
    return respond(500, { error: 'Storage failed: ' + err.message }, corsHeaders);
  }

  return respond(200, { success: true, message: 'Subscribed' }, corsHeaders);
}

async function handleSubmit(request, env, corsHeaders) {
  const data = await parseBody(request);
  if (!data) return respond(400, { error: 'Invalid request body' }, corsHeaders);

  const required = ['title', 'category', 'baseGame', 'email'];
  for (const field of required) {
    if (!data[field] || !data[field].trim()) {
      return respond(400, { error: `Missing field: ${field}` }, corsHeaders);
    }
  }

  const id = crypto.randomUUID();
  const submission = {
    id,
    title: data.title.trim(),
    category: data.category.trim(),
    baseGame: data.baseGame.trim(),
    email: data.email.trim().toLowerCase(),
    description: (data.description || '').trim(),
    rulesUrl: (data.rulesUrl || '').trim(),
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };

  await env.STORE.put(`mod:${id}`, JSON.stringify(submission));

  return respond(200, { success: true, id, message: 'Submission received' }, corsHeaders);
}

async function parseBody(request) {
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return await request.json();
    }
    if (ct.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      return Object.fromEntries(new URLSearchParams(text));
    }
    return null;
  } catch {
    return null;
  }
}

function respond(status, body, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}
