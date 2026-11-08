import { AbsoluteFill } from "remotion";
import { AMAN, huruf, warna } from "./tema";

// Penanda sementara sampai storyboard diterima. Bukan bagian video final.
export const Placeholder: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: warna.canvas,
        color: warna.ink,
        padding: `${AMAN.atasBawah}px ${AMAN.sisi}px`,
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: huruf.mono,
          fontSize: 44,
          color: warna.accent,
          letterSpacing: "0.08em",
        }}
      >
        00 //
      </div>
      <div
        style={{
          fontFamily: huruf.stensil,
          fontSize: 120,
          letterSpacing: "0.06em",
          lineHeight: 1,
        }}
      >
        SENTRA SHIELD
      </div>
      <div style={{ fontFamily: huruf.kondensasi, fontSize: 52, color: warna.ink2 }}>
        Menunggu storyboard
      </div>
    </AbsoluteFill>
  );
};
