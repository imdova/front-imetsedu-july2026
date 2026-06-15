/** Site-settings DAL — branding theme + integrations catalogue. */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as db from "@/lib/db/site-settings";

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

export const fetchIntegrations = () => wrap(db.getIntegrations, "Failed to load integrations");
export const fetchTheme = () => wrap(db.getTheme, "Failed to load theme");
