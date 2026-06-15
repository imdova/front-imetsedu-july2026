"use client";

import { useEffect } from "react";
import { bootstrapApiClient } from "@/lib/api-client.config";

/**
 * Configures the integration HTTP client once on the client. Dormant while the
 * DAL serves dummy data; ready the moment a DAL function targets the live API.
 */
export function AdminBootstrap() {
  useEffect(() => {
    bootstrapApiClient();
  }, []);
  return null;
}
