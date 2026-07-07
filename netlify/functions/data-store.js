import { getStore } from "@netlify/blobs";

// Fonction générique : sert de "tiroir" unique pour toutes les données
// synchronisées de l'app (maîtrise, high scores, et plus tard cave,
// dégustations, wishlist…). Chaque type de donnée = une clé différente,
// mais c'est toujours le même code qui les gère.
//
// GET  /api/data/mastery     → relit la dernière valeur enregistrée
// POST /api/data/mastery     → enregistre une nouvelle valeur (écrase l'ancienne)

export default async (req, context) => {
  const store = getStore("scag-data");
  const { key } = context.params;

  if (!key) {
    return new Response(JSON.stringify({ error: "clé manquante" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    const data = await store.get(key, { type: "json" });
    return new Response(JSON.stringify(data ?? null), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "POST") {
    const body = await req.json();
    await store.setJSON(key, body);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/data/:key",
};
