/** Shared theme constant used by both the client provider and the
 * server-rendered no-flash bootstrap script. Kept in its own (non-"use client")
 * module so the server component can import it without pulling in client code. */
export const THEME_STORAGE_KEY = "theme";
