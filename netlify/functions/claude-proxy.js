// Proxy sécurisé vers l'API Anthropic pour les modes IA de l'app
// (VA "développement", Partiels rédactionnels, Oral, Simulation client).
// La clé API reste côté serveur (variable d'environnement Netlify
// ANTHROPIC_API_KEY), jamais exposée au navigateur.
//
// POST /api/claude   body: { system?, messages, max_tokens? }
// → renvoie tel quel le JSON de réponse de l'API Anthropic (data.content[0].text etc.)

export default async (req, context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY non configurée sur Netlify (Site settings → Environment variables)." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let payload;
  try {
    payload = await req.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Corps JSON invalide" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { system, messages, max_tokens } = payload || {};
  if (!messages) {
    return new Response(JSON.stringify({ error: "'messages' manquant" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: max_tokens || 1000,
        ...(system ? { system } : {}),
        messages,
      }),
    });

    const data = await anthropicRes.json();
    return new Response(JSON.stringify(data), {
      status: anthropicRes.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Échec de la requête vers Anthropic (réseau)" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/claude",
};
