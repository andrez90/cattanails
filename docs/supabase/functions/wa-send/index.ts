// Catta Nails 29 · envío automático de WhatsApp con la API oficial de Meta (WhatsApp Cloud API).
// Lo llama pg_cron cada 5 minutos. Solo envía si:
//  1) en el panel está activado "Envío automático" (content.wa.cloud.activo = true), y
//  2) existen los secretos WA_TOKEN y WA_PHONE_ID en Supabase (Edge Functions > Secrets).
// Cada tipo de mensaje (confirmacion, recordatorio, gracias, vuelve, curso, lista) se envía solo si tiene
// una plantilla aprobada por Meta configurada en el panel. Si no, se queda en el panel para enviarla con un toque.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SB = Deno.env.get("SUPABASE_URL")!;
const KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WA_TOKEN = Deno.env.get("WA_TOKEN") ?? "";
const WA_PHONE_ID = Deno.env.get("WA_PHONE_ID") ?? "";

async function rpc(name: string, body: unknown) {
  const r = await fetch(`${SB}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`${name} ${r.status} ${await r.text()}`);
  return r.json();
}

type Tpl = { nombre: string; idioma?: string; variables?: string[] };

Deno.serve(async () => {
  const cfg = await rpc("wa_config", {});
  if (!cfg?.activo || !WA_TOKEN || !WA_PHONE_ID) {
    return Response.json({ ok: true, skipped: !cfg?.activo ? "desactivado" : "faltan WA_TOKEN / WA_PHONE_ID" });
  }
  const plantillas: Record<string, Tpl> = cfg.plantillas ?? {};
  const kinds = Object.keys(plantillas).filter((k) => plantillas[k]?.nombre);
  if (!kinds.length) return Response.json({ ok: true, skipped: "sin plantillas" });

  const msgs = await rpc("wa_claim", { p_kinds: kinds, p_limit: 20 });
  let sent = 0, failed = 0;
  for (const m of msgs) {
    const t = plantillas[m.kind];
    const params = (t.variables ?? []).map((v) => ({ type: "text", text: String(m.params?.[v] ?? "").slice(0, 300) || "-" }));
    try {
      const r = await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(10000),
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: String(m.to_phone).replace(/\D/g, ""),
          type: "template",
          template: { name: t.nombre, language: { code: t.idioma ?? "es" }, components: params.length ? [{ type: "body", parameters: params }] : [] },
        }),
      });
      if (!r.ok) throw new Error(`${r.status} ${(await r.text()).slice(0, 250)}`);
      await rpc("wa_done", { p_id: m.id, p_ok: true });
      sent++;
    } catch (e) {
      await rpc("wa_done", { p_id: m.id, p_ok: false, p_error: String(e) });
      failed++;
    }
  }
  return Response.json({ ok: true, sent, failed });
});
