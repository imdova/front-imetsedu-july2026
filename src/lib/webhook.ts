/**
 * Fire-and-forget POST of a lead payload to an external webhook (e.g. n8n).
 *
 * Uses `no-cors` + `text/plain` so the browser skips the CORS preflight and the
 * request reaches webhooks that don't send CORS headers; the JSON body is still
 * delivered verbatim (n8n parses it). Best-effort — never throws, never blocks
 * the form's own success flow.
 */
export async function postWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ ...payload, submittedAt: new Date().toISOString() }),
      keepalive: true,
    });
  } catch {
    /* best-effort: ignore network/CORS errors */
  }
}
