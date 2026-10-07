import { getStore } from "@netlify/blobs";

const KEY = /^(a\d{1,2}|l\d{1,2}_[0-2])$/;

export default async (req) => {
  const store = getStore({ name: "checklist", consistency: "strong" });
  const cur = (await store.get("state", { type: "json" })) || {};
  if (req.method === "POST") {
    let body;
    try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
    for (const [k, v] of Object.entries(body?.set || {})) {
      if (!KEY.test(k)) continue;
      if (v == null) delete cur[k];
      else if (typeof v === "string" && v.length <= 40) cur[k] = v;
    }
    await store.setJSON("state", cur);
  } else if (req.method !== "GET") {
    return new Response("method not allowed", { status: 405 });
  }
  return Response.json(cur, { headers: { "Cache-Control": "no-store" } });
};

export const config = { path: "/api/state" };
