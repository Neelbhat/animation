"use client";

import React, { useEffect, useRef } from "react";

/**
 * ParticleResolve
 * A field of particles begins as scattered noise and resolves into a
 * hexagonal molecular lattice as the hero loads — then holds a slow,
 * living drift. Visual thesis for "Where structure becomes certainty."
 */
export default function ParticleResolve({
  className = "",
  accent = "#3EBD8F",
}: {
  className?: string;
  accent?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const lattice: { x: number; y: number }[] = [];
    const ROWS = 7;
    const COLS = 6;

    function buildLattice() {
      lattice.length = 0;
      const marginX = width * 0.12;
      const marginY = height * 0.12;
      const spanX = width - marginX * 2;
      const spanY = height - marginY * 2;
      for (let r = 0; r < ROWS; r++) {
        const rowOffset = r % 2 === 0 ? 0 : spanX / (COLS * 2);
        for (let c = 0; c < COLS; c++) {
          const x = marginX + rowOffset + (c / (COLS - 1)) * spanX * 0.86;
          const y = marginY + (r / (ROWS - 1)) * spanY;
          lattice.push({ x, y });
        }
      }
    }

    type P = {
      x: number;
      y: number;
      tx: number;
      ty: number;
      r: number;
      driftX: number;
      driftY: number;
      phase: number;
    };
    let particles: P[] = [];

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLattice();
      particles = lattice.map((p) => ({
        x: width / 2 + (Math.random() - 0.5) * width * 1.4,
        y: height / 2 + (Math.random() - 0.5) * height * 1.4,
        tx: p.x,
        ty: p.y,
        r: 1.6 + Math.random() * 1.6,
        driftX: Math.random() * 1000,
        driftY: Math.random() * 1000,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const RESOLVE_MS = reduceMotion ? 1 : 2200;
    let raf = 0;

    function neighborsOf(i: number) {
      const out: number[] = [];
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      if (col < COLS - 1) out.push(i + 1);
      if (row < ROWS - 1) out.push(i + COLS);
      return out;
    }

    function draw(now: number) {
      const t = Math.min(1, (now - start) / RESOLVE_MS);
      const ease = 1 - Math.pow(1 - t, 3);

      ctx!.clearRect(0, 0, width, height);

      // connective lines fade in only once mostly resolved
      const lineAlpha = Math.max(0, (t - 0.65) / 0.35);
      if (lineAlpha > 0) {
        ctx!.strokeStyle = accent;
        ctx!.lineWidth = 1;
        for (let i = 0; i < particles.length; i++) {
          const a = particles[i];
          for (const j of neighborsOf(i)) {
            const b = particles[j];
            ctx!.globalAlpha = lineAlpha * 0.18;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      const driftAmp = ease * 3.5;
      for (const p of particles) {
        const settleX = p.tx + (p.x === p.tx ? 0 : 0);
        void settleX;
        const targetX =
          p.tx + Math.sin(now * 0.0005 + p.driftX) * driftAmp;
        const targetY =
          p.ty + Math.cos(now * 0.0006 + p.driftY) * driftAmp;

        p.x += (targetX - p.x) * (reduceMotion ? 1 : 0.06 + ease * 0.02);
        p.y += (targetY - p.y) * (reduceMotion ? 1 : 0.06 + ease * 0.02);

        const pulse = 0.55 + 0.45 * Math.sin(now * 0.002 + p.phase);
        ctx!.globalAlpha = 0.35 + 0.65 * ease;
        ctx!.fillStyle = accent;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * (0.85 + 0.3 * pulse), 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [accent]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
