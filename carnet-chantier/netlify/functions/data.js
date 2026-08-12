const { getStore } = require('@netlify/blobs');

// Clés autorisées, pour éviter que n'importe quel nom de clé soit utilisé
const ALLOWED_KEYS = ['expenses', 'workers', 'categories'];

// Récupère le store Netlify Blobs, avec config manuelle en secours
function getCarnetStore() {
  const siteID = process.env.NETLIFY_SITE_ID;
  const token = process.env.NETLIFY_AUTH_TOKEN;

  if (siteID && token) {
    return getStore({ name: 'carnet-chantier', siteID, token });
  }

  return getStore('carnet-chantier');
}

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

  let store;
  try {
    store = getCarnetStore();
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: "Impossible d'initialiser le stockage Netlify Blobs",
        message: error.message
      })
    };
  }

  if (event.httpMethod === 'GET') {
    const value = await store.get(key);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: value || 'null'
    };
  }

  if (event.httpMethod === 'POST') {
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
