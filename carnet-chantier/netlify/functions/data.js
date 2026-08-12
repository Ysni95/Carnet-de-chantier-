const { getStore } = require('@netlify/blobs');

// Clés autorisées, pour éviter que n'importe quel nom de clé soit utilisé
const ALLOWED_KEYS = ['expenses', 'workers'];

exports.handler = async (event) => {
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
