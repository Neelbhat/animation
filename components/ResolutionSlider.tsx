"use client";

import React, { useEffect, useRef, useState } from "react";

/* Deterministic pseudo-random so server/client render match */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawNoise(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  const rand = mulberry32(42);
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0E1512";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 260; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.6 + rand() * 2.2;
    ctx.globalAlpha = 0.12 + rand() * 0.28;
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // faint scattered streaks to read as "unresolved signal"
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = "#E9F0EC";
  for (let i = 0; i < 30; i++) {
    const x = rand() * w;
    const y = rand() * h;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + (rand() - 0.5) * 40, y + (rand() - 0.5) * 40);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawResolved(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#0E1512";
  ctx.fillRect(0, 0, w, h);

  const rows = 6;
  const cols = 7;
  const marginX = w * 0.1;
  const marginY = h * 0.14;
  const spanX = w - marginX * 2;
  const spanY = h - marginY * 2;
  const nodes: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : spanX / (cols * 2);
    for (let c = 0; c < cols; c++) {
      nodes.push({
        x: marginX + offset + (c / (cols - 1)) * spanX * 0.86,
        y: marginY + (r / (rows - 1)) * spanY,
      });
    }
  }

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.1;
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < nodes.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    if (col < cols - 1) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
      ctx.stroke();
    }
    if (row < rows - 1) {
      ctx.beginPath();
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[i + cols].x, nodes[i + cols].y);
      ctx.stroke();
    }
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = accent;
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function ResolutionSlider({
  accent = "#3EBD8F",
  className = "",
}: {
  accent?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null);
  const resolvedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);

  useEffect(() => {
    function render() {
      const wrap = wrapRef.current;
      const nCanvas = noiseCanvasRef.current;
      const rCanvas = resolvedCanvasRef.current;
      if (!wrap || !nCanvas || !rCanvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      [nCanvas, rCanvas].forEach((c) => {
        c.width = rect.width * dpr;
        c.height = rect.height * dpr;
        c.style.width = rect.width + "px";
        c.style.height = rect.height + "px";
        const cx = c.getContext("2d");
        if (cx) cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      });
      const nCtx = nCanvas.getContext("2d");
      const rCtx = rCanvas.getContext("2d");
      if (nCtx) drawNoise(nCtx, rect.width, rect.height, accent);
      if (rCtx) drawResolved(rCtx, rect.width, rect.height, accent);
    }
    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [accent]);

  function setFromClientX(clientX: number) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(97, Math.max(3, pct)));
  }

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current) return;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      setFromClientX(clientX);
    }
    function onUp() {
      dragging.current = false;
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full aspect-[16/10] rounded-[2rem] overflow-hidden border border-white/10 select-none ${className}`}
      onMouseDown={(e) => {
        dragging.current = true;
        setFromClientX(e.clientX);
      }}
      onTouchStart={(e) => {
        dragging.current = true;
        setFromClientX(e.touches[0].clientX);
      }}
    >
      <canvas ref={noiseCanvasRef} className="absolute inset-0 w-full h-full" />
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      >
        <canvas ref={resolvedCanvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      <div className="absolute top-5 left-5 text-[11px] tracking-[0.16em] uppercase text-[#E9F0EC]/45 pointer-events-none">
        Unresolved signal
      </div>
      <div className="absolute top-5 right-5 text-[11px] tracking-[0.16em] uppercase pointer-events-none" style={{ color: accent }}>
        Validated structure
      </div>

      <div
        className="absolute top-0 bottom-0 w-px bg-[#E9F0EC]/40 cursor-ew-resize"
        style={{ left: `${split}%` }}
      >
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#0E1512] border flex items-center justify-center text-[#E9F0EC] text-xs"
          style={{ borderColor: accent }}
        >
          ↔
        </div>
      </div>
    </div>
  );
}
