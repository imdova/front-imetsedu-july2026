import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Generated app icon (favicon / PWA). Overridden at runtime by a branding
 * favicon when one is configured in site settings. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1111D4",
          color: "white",
          fontSize: 300,
          fontWeight: 800,
          fontFamily: "sans-serif",
        }}
      >
        I
      </div>
    ),
    size,
  );
}
