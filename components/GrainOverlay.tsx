"use client";

export default function GrainOverlay() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-[90] opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        backgroundSize: "160px 160px",
        animation: "grain-shift 0.6s steps(4) infinite",
      }}
    >
      <style>{`
        @keyframes grain-shift {
          0% { transform: translate(0,0); }
          25% { transform: translate(-2%,-1%); }
          50% { transform: translate(1%,2%); }
          75% { transform: translate(-1%,1%); }
          100% { transform: translate(0,0); }
        }
      `}</style>
    </div>
  );
}
