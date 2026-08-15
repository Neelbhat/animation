"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Marquee({
  items,
  className = "",
  speed = 40,
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.scrollWidth / 2;

    const tween = gsap.to(track, {
      x: -width,
      duration: width / speed,
      ease: "none",
      repeat: -1,
    });

    return () => {
      tween.kill();
    };
  }, [speed]);

  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex gap-4 w-max">
        {doubled.map((t, i) => (
          <span
            key={i}
            className="rounded-full border border-white/10 px-6 py-3 text-sm text-[#E9F0EC]/60 whitespace-nowrap shrink-0"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
