"use client";

import { bootstrapApiClient } from "@/lib/api-client.config";

// Configure the integration HTTP client (base URL + token provider) as soon as
// this module loads on the client, before any auth/data request fires.
bootstrapApiClient();

/** Renders nothing — its sole job is to run the one-time client bootstrap. */
export function ApiBootstrap() {
  return null;
}
