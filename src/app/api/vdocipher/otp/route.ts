import { NextRequest, NextResponse } from "next/server";

const VDOCIPHER_API_BASE = "https://dev.vdocipher.com/api/videos";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://main-api.imetsedu.com";
const DEFAULT_TTL = 300;

async function resolveApiSecret(): Promise<string | undefined> {
  try {
    const res = await fetch(`${BACKEND_URL}/general-settings`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const settings = Array.isArray(data) ? data[0] : data;
      const secret: string | undefined = settings?.vdocipher?.apiSecret;
      if (secret) return secret;
    }
  } catch {
    // fall through to env var
  }
  return process.env.VDOCIPHER_API_SECRET;
}

export async function POST(request: NextRequest) {
  const apiSecret = await resolveApiSecret();
  if (!apiSecret) {
    return NextResponse.json({ message: "VdoCipher API secret is not configured" }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const videoId = typeof body?.videoId === "string" ? body.videoId.trim() : "";
  if (!videoId) {
    return NextResponse.json({ message: "Missing videoId" }, { status: 400 });
  }

  const ttl = Number.isFinite(body?.ttl) ? Number(body.ttl) : DEFAULT_TTL;

  const response = await fetch(
    `${VDOCIPHER_API_BASE}/${encodeURIComponent(videoId)}/otp`,
    {
      method: "POST",
      headers: {
        Authorization: `Apisecret ${apiSecret}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ ttl }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { message: "Failed to generate VdoCipher OTP", details: errorText },
      { status: response.status },
    );
  }

  const data = (await response.json()) as { otp?: string; playbackInfo?: string };
  if (!data.otp || !data.playbackInfo) {
    return NextResponse.json({ message: "Invalid response from VdoCipher" }, { status: 502 });
  }

  return NextResponse.json(
    { otp: data.otp, playbackInfo: data.playbackInfo },
    { headers: { "Cache-Control": "no-store" } },
  );
}
