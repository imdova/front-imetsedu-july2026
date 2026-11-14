import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://main-api.imetsedu.com";
const DEFAULT_TTL = 300;

/**
 * Playback OTP for a lecture video. The backend holds every VdoCipher account's
 * secret and works out which account owns the video, so this route no longer
 * touches a secret at all — it is only a same-origin relay for the player.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
  if (!videoId) {
    return NextResponse.json({ message: "Missing videoId" }, { status: 400 });
  }
  const ttl = Number.isFinite(body?.ttl) ? Number(body.ttl) : DEFAULT_TTL;

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/vdocipher/otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ videoId, ttl }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Could not reach the video service" }, { status: 502 });
  }

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { message: "Failed to generate VdoCipher OTP", details: errorText },
      { status: response.status },
    );
  }

  const data = (await response.json().catch(() => null)) as { otp?: string; playbackInfo?: string } | null;
  if (!data?.otp || !data.playbackInfo) {
    return NextResponse.json({ message: "Invalid response from VdoCipher" }, { status: 502 });
  }

  return NextResponse.json(
    { otp: data.otp, playbackInfo: data.playbackInfo },
    { headers: { "Cache-Control": "no-store" } },
  );
}
