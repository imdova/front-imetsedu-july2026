/**
 * Shared HTTP client surface for the services layer.
 *
 * Per CLAUDE.md: all external I/O must go through services/http/.
 * Internally this re-exports the lower-level transport (lib/api-client),
 * keeping the actual fetch/auth/error logic in one place while giving
 * the services tree a single import target.
 */

export { api, ok, fail, toMessage } from "@integration/lib/api-client";
export type { Result } from "@integration/lib/api-client";
