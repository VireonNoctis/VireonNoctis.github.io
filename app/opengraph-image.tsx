import { ImageResponse } from "next/og";

export const alt = "Vireon Noctis — Software, Stories, Sound";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "66px 76px",
          position: "relative",
          overflow: "hidden",
          color: "#edf5ff",
          background: "linear-gradient(125deg, #070a12 0%, #101a2b 54%, #080d18 100%)",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ position: "absolute", right: -95, top: -190, width: 650, height: 650, border: "1px solid rgba(163,199,255,.23)", borderRadius: 400, display: "flex" }} />
        <div style={{ position: "absolute", right: -8, top: -105, width: 470, height: 470, border: "1px solid rgba(163,199,255,.17)", borderRadius: 300, display: "flex" }} />
        <div style={{ position: "absolute", right: 155, top: 92, width: 190, height: 190, borderRadius: 120, background: "radial-gradient(circle, rgba(113,164,255,.28), rgba(113,164,255,0) 72%)", display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 17, letterSpacing: 4, color: "#b9cce8" }}>
          <div style={{ width: 42, height: 42, border: "1px solid #9ebcf1", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "#dce9ff", fontSize: 27 }}>✳</div>
          VIREON NOCTIS
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 850 }}>
          <div style={{ fontSize: 15, letterSpacing: 5, color: "#94b5ec" }}>AN INDEPENDENT DIGITAL WORLD</div>
          <div style={{ fontSize: 78, lineHeight: 1.02, letterSpacing: -3, fontWeight: 700, display: "flex", flexDirection: "column" }}>
            <span>Software.</span>
            <span style={{ color: "#b6ccf3" }}>Stories. Sound.</span>
          </div>
          <div style={{ marginTop: 8, fontSize: 22, lineHeight: 1.5, color: "#b9c5d8" }}>
            A personal archive of projects, anime, music, and things made with intent.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(177,201,239,.24)", paddingTop: 22, fontSize: 15, letterSpacing: 2, color: "#94a8c8" }}>
          <span>VIREONNOCTIS.GITHUB.IO</span>
          <span>BUILT IN THE QUIET HOURS · 2026</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
