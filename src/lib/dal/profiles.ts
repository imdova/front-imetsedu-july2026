/**
 * Public profiles DAL — FULLY LIVE (NestJS `profiles` module).
 * Every account gets /profile/:username; owners edit presentation fields.
 */
import { type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/profiles";

export type PublicProfile = svc.PublicProfileDto;
export type PublicProfileInput = svc.UpdatePublicProfileInput;

export async function fetchPublicProfile(username: string): Promise<Result<PublicProfile>> {
  return svc.getPublicProfile(username);
}
export async function fetchMyPublicProfile(): Promise<Result<PublicProfile>> {
  return svc.getMyPublicProfile();
}
export async function updateMyPublicProfile(input: PublicProfileInput): Promise<Result<PublicProfile>> {
  return svc.updateMyPublicProfile(input);
}
