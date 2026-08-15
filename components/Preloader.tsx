"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";

export default function Preloader({ onDone }: { onDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    const obj = { val: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        setDone(true);
        onDone();
      },
    });

    tl.to(obj, {
      val: 100,
      duration: 1.3,
      ease: "power2.inOut",
      onUpdate: () => {
        if (countRef.current) countRef.current.textContent = String(Math.round(obj.val));
      },
    })
      .to(".preloader-logo", { opacity: 0, duration: 0.3 }, "-=0.15")
      .to(rootRef.current, {
        yPercent: -100,
        duration: 0.9,
        ease: "power4.inOut",
      });

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] bg-[#0E1512] flex flex-col items-center justify-center"
    >
      <div className="preloader-logo text-[#E9F0EC] font-semibold text-lg tracking-tight mb-6">
        Vantar&nbsp;Bio
      </div>
      <div className="text-[#3EBD8F] font-mono text-sm tabular-nums">
        <span ref={countRef}>0</span>%
      </div>
    </div>
  );
}
