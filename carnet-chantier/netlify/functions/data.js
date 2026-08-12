const { getStore } = require('@netlify/blobs');

// Clés autorisées, pour éviter que n'importe quel nom de clé soit utilisé
const ALLOWED_KEYS = ['expenses', 'workers'];

exports.handler = async (event) => {
  const expectedPassword = process.env.CARNET_PASSWORD;
  const providedPassword = event.headers['x-carnet-password'] || event.headers['X-Carnet-Password'];

  if (!expectedPassword) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "CARNET_PASSWORD n'est pas configuré sur Netlify" })
    };
  }

  if (providedPassword !== expectedPassword) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Mot de passe incorrect' })
    };
  }

  const key = event.queryStringParameters && event.queryStringParameters.key;

  if (!key || !ALLOWED_KEYS.includes(key)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Clé invalide ou manquante' })
    };
  }

  const store = getStore('carnet-chantier');

  if (event.httpMethod === 'GET') {
    const value = await store.get(key);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: value || 'null'
    };
  }

  if (event.httpMethod === 'POST') {
    // event.body est déjà une chaîne JSON envoyée par la page (ex: "[{...}]")
    await store.set(key, event.body || '[]');
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  }

  return {
    statusCode: 405,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ error: 'Méthode non autorisée' })
  };
};
