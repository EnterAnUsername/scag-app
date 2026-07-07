import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const store = getStore("cave-test-store");

  if (req.method === "POST") {
    const body = await req.json();
    await store.setJSON("message-test", {
      text: body.text,
      savedAt: new Date().toISOString(),
    });
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (req.method === "GET") {
    const data = await store.get("message-test", { type: "json" });
    return new Response(JSON.stringify(data || null), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/cave-test",
};
