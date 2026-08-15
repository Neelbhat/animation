"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Splits `text` into words, each wrapped in an overflow-hidden mask so the
 * word itself can rise up from below the mask line — reads as ink resolving
 * into focus rather than a generic fade-up.
 */
export default function SplitReveal({
  text,
  className = "",
  scrollTrigger = false,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  scrollTrigger?: boolean;
  delay?: number;
  as?: "span" | "h1" | "h2";
}) {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const words = el.querySelectorAll(".split-word-inner");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { yPercent: 115, rotate: 4 },
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.045,
          delay,
          scrollTrigger: scrollTrigger
            ? { trigger: el, start: "top 80%", toggleActions: "play none none none" }
            : undefined,
        }
      );
    }, el);

    return () => ctx.revert();
  }, [scrollTrigger, delay]);

  const words = text.split(" ");

  return (
    <Tag ref={containerRef as any} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-top pb-[0.08em]">
          <span className="split-word-inner inline-block">
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
