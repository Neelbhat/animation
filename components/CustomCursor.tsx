"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // skip on touch devices — a mouse-follow cursor makes no sense there
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    const xTo = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });
    const xToDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const yToDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });

    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xToDot(e.clientX);
      yToDot(e.clientY);
    };

    const grow = () => gsap.to(ring, { scale: 2.2, duration: 0.3, ease: "power2.out" });
    const shrink = () => gsap.to(ring, { scale: 1, duration: 0.3, ease: "power2.out" });

    window.addEventListener("mousemove", move);

    const interactive = document.querySelectorAll('[data-cursor="link"]');
    interactive.forEach((el) => {
      el.addEventListener("mouseenter", grow);
      el.addEventListener("mouseleave", shrink);
    });

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    return () => {
      window.removeEventListener("mousemove", move);
      interactive.forEach((el) => {
        el.removeEventListener("mouseenter", grow);
        el.removeEventListener("mouseleave", shrink);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="hidden md:block fixed top-0 left-0 w-8 h-8 rounded-full border border-[#3EBD8F]/70 pointer-events-none z-[100] mix-blend-difference"
      />
      <div
        ref={dotRef}
        className="hidden md:block fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#3EBD8F] pointer-events-none z-[100]"
      />
    </>
  );
}
