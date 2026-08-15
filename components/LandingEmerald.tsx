"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "./useSmoothScroll";
import CustomCursor from "./CustomCursor";
import GrainOverlay from "./GrainOverlay";
import Preloader from "./Preloader";
import SplitReveal from "./SplitReveal";
import Magnetic from "./Magnetic";
import TiltCard from "./TiltCard";
import Marquee from "./Marquee";
import ParticleResolve from "./ParticleResolve";
import ResolutionSlider from "./ResolutionSlider";
import Molecule3D from "./Molecule3D";

gsap.registerPlugin(ScrollTrigger);

/* ---------- Reveal: scroll-triggered fade/slide-up, supports staggered children ---------- */
function Reveal({
  children,
  className = "",
  delay = 0,
  stagger = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = stagger ? gsap.utils.toArray(el.children) : el;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets as any,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay,
          stagger: stagger || 0,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 82%", toggleActions: "play none none none" },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/* ---------- Counter: animates a numeric value up when scrolled into view ---------- */
function Counter({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
  const suffix = value.replace(/[0-9.]/g, "");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || isNaN(numeric)) return;
    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: numeric,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" },
        onUpdate: () => {
          const isDecimal = value.includes(".");
          el.textContent = (isDecimal ? obj.val.toFixed(1) : Math.round(obj.val)) + suffix;
        },
      });
    }, el);
    return () => ctx.revert();
  }, [numeric, suffix, value]);

  return (
    <div ref={ref} className={className}>
      0{suffix}
    </div>
  );
}

/* ---------- Lattice: draws itself in via GSAP; optional pin-scrubbed rotation ---------- */
function Lattice({
  size = 400,
  stroke = "#3EBD8F",
  hub = "#E9F0EC",
  groupRefExternal,
}: {
  size?: number;
  stroke?: string;
  hub?: string;
  groupRefExternal?: React.RefObject<SVGGElement>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const internalGroupRef = useRef<SVGGElement>(null);
  const groupRef = groupRefExternal || internalGroupRef;

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll("path.spoke");
    const nodes = svg.querySelectorAll("circle.node");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: svg, start: "top 80%", toggleActions: "play none none none" },
      });

      paths.forEach((p) => {
        const len = (p as SVGPathElement).getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });

      tl.to(paths, { strokeDashoffset: 0, duration: 0.9, ease: "power3.inOut", stagger: 0.09 }).fromTo(
        nodes,
        { opacity: 0, scale: 0.3, transformOrigin: "center" },
        { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2.2)", stagger: 0.08 },
        "-=0.5"
      );
    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={svgRef} viewBox="0 0 400 400" width={size} height={size}>
      <g ref={groupRef}>
        <g stroke={stroke} strokeWidth="1.6" strokeLinecap="round" fill="none">
          <path className="spoke" d="M200,200 L200,60" />
          <path className="spoke" d="M200,200 L320,110" />
          <path className="spoke" d="M200,200 L340,220" />
          <path className="spoke" d="M200,200 L280,330" />
          <path className="spoke" d="M200,200 L120,330" />
          <path className="spoke" d="M200,200 L60,220" />
          <path className="spoke" d="M200,200 L80,110" />
        </g>
        <circle cx="200" cy="200" r="14" fill={hub} />
        <g fill={stroke}>
          <circle className="node" cx="200" cy="60" r="7" />
          <circle className="node" cx="320" cy="110" r="6" />
          <circle className="node" cx="340" cy="220" r="6" />
          <circle className="node" cx="280" cy="330" r="6" />
          <circle className="node" cx="120" cy="330" r="6" />
          <circle className="node" cx="60" cy="220" r="6" />
          <circle className="node" cx="80" cy="110" r="6" />
        </g>
      </g>
    </svg>
  );
}

const services = [
  { title: "Target Identification", desc: "Computational and structural biology to identify disease-driving targets others miss, validated before a single compound is synthesized." },
  { title: "Hit-to-Lead Optimization", desc: "AI-assisted compound design that compresses months of medicinal chemistry iteration into weeks." },
  { title: "Structural Validation", desc: "Cryo-EM and predictive modeling to confirm binding mechanism at atomic resolution before advancing a candidate." },
  { title: "Preclinical Translation", desc: "Bridging validated candidates to IND-ready packages with the mechanistic data regulators actually want to see." },
];

const stats = [
  { value: "340+", label: "Molecular pathways mapped" },
  { value: "18", label: "Active discovery programs" },
  { value: "99.7%", label: "Target validation accuracy" },
  { value: "12", label: "Years of published research" },
];

const domains = ["Oncology", "Immunology", "Neuroscience", "Rare Disease", "Metabolic Disease", "Infectious Disease"];

export default function LandingEmerald() {
  useSmoothScroll();

  const [navSolid, setNavSolid] = useState(false);
  const [ready, setReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const particleWrapRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const researchSectionRef = useRef<HTMLElement>(null);
  const researchGroupRef = useRef<SVGGElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (!ready) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const hero = heroRef.current;
    const glow = glowRef.current;
    if (!hero || !glow) return;
    const move = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      gsap.to(glow, {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        duration: 0.6,
        ease: "power3.out",
      });
    };
    hero.addEventListener("mousemove", move);
    return () => hero.removeEventListener("mousemove", move);
  }, [ready]);

  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-pill", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 })
        .fromTo(".hero-eyebrow", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.25")
        .fromTo(".hero-body", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.5")
        .fromTo(".hero-actions", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
        .fromTo(particleWrapRef.current, { opacity: 0 }, { opacity: 1, duration: 1.1 }, "-=0.9");

      gsap.to(particleWrapRef.current, {
        y: 60,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
      });
    }, heroRef);
    return () => ctx.revert();
  }, [ready]);

  useLayoutEffect(() => {
    if (!ready) return;
    const section = researchSectionRef.current;
    const group = researchGroupRef.current;
    if (!section || !group) return;

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=900",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
      });

      gsap.to(group, {
        rotate: 140,
        transformOrigin: "200px 200px",
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=900",
          scrub: 1,
        },
      });

      return () => st.kill();
    }, researchSectionRef);

    return () => ctx.revert();
  }, [ready]);

  useLayoutEffect(() => {
    if (!ready) return;
    const bar = progressRef.current;
    if (!bar) return;
    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        gsap.set(bar, { scaleX: self.progress });
      },
    });
    return () => st.kill();
  }, [ready]);

  return (
    <>
      <Preloader onDone={() => setReady(true)} />
      {ready && <CustomCursor />}
      <GrainOverlay />

      <div
        ref={progressRef}
        className="fixed top-0 left-0 right-0 h-[2px] bg-[#3EBD8F] origin-left z-[60] scale-x-0"
        style={{ transformOrigin: "left" }}
      />

      <div className="w-full bg-[#0E1512] text-[#E9F0EC] font-[Inter,sans-serif] overflow-x-hidden md:cursor-none">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.08] z-0"
          style={{ background: "radial-gradient(50% 40% at 85% 10%, #3EBD8F 0%, transparent 70%)" }}
        />

        {/* NAV */}
    {/* NAV */}
<nav
  className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5 transition-colors duration-300 ${
    navSolid ? "bg-[#0E1512]/90 backdrop-blur-md border-b border-white/10" : ""
  }`}
>
  <a href="#" data-cursor="link" className="flex items-center gap-2.5">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" fill="#3EBD8F" />
      <circle cx="12" cy="3" r="2" fill="#3EBD8F" fillOpacity="0.55" />
      <circle cx="21" cy="12" r="2" fill="#3EBD8F" fillOpacity="0.55" />
      <circle cx="12" cy="21" r="2" fill="#3EBD8F" fillOpacity="0.55" />
      <circle cx="3" cy="12" r="2" fill="#3EBD8F" fillOpacity="0.55" />
      <path d="M12 5V9.5M12 14.5V19M14.5 12H19M5 12H9.5" stroke="#3EBD8F" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
    <span className="font-semibold text-lg tracking-tight">Vantar&nbsp;Bio</span>
  </a>
  <div className="hidden md:flex items-center gap-8 text-sm text-[#E9F0EC]/55">
    {["about", "resolution", "platform", "research", "services", "impact"].map((id) => (
      <a key={id} href={`#${id}`} data-cursor="link" className="hover:text-[#E9F0EC] transition-colors capitalize">
        {id}
      </a>
    ))}
  </div>
  <div className="flex items-center gap-3">
    <Magnetic className="hidden sm:inline-block">
      <button className="rounded-full border border-[#E9F0EC]/20 px-5 py-2 text-sm hover:bg-white/5 transition-colors">
        Contact
      </button>
    </Magnetic>
    <Magnetic>
      <button className="rounded-full bg-[#3EBD8F] text-[#0E1512] px-5 py-2 text-sm font-medium hover:brightness-110 transition-all">
        Start Now
      </button>
    </Magnetic>
  </div>
</nav>

        {/* HERO — full-bleed particle field behind the copy, not boxed */}
        <section
          ref={heroRef}
          className="relative z-10 min-h-[92vh] md:min-h-[88vh] flex items-center pt-24 pb-20 overflow-hidden"
        >
          <div ref={particleWrapRef} className="absolute inset-0">
            <ParticleResolve className="absolute inset-0 w-full h-full" accent="#3EBD8F" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, #0E1512 0%, rgba(14,21,18,0.92) 32%, rgba(14,21,18,0.55) 58%, rgba(14,21,18,0.25) 100%)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, rgba(14,21,18,0.15) 0%, transparent 22%, transparent 78%, #0E1512 100%)" }}
            />
          </div>

          <div
            ref={glowRef}
            className="absolute w-[420px] h-[420px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 opacity-20"
            style={{ background: "radial-gradient(circle, #3EBD8F 0%, transparent 70%)", filter: "blur(40px)" }}
          />

          <div className="relative max-w-7xl mx-auto px-6 md:px-10 w-full">
            <div className="relative max-w-xl">
              <div className="flex gap-3 mb-8">
                <div className="hero-pill rounded-2xl bg-[#3EBD8F] text-[#0E1512] px-5 py-3 flex items-center gap-3">
                  <span className="text-xl font-semibold">
                    <Counter value="340+" />
                  </span>
                  <span className="text-[11px] leading-tight text-[#0E1512]/70">
                    molecular
                    <br />
                    pathways mapped
                  </span>
                </div>
                <div className="hero-pill rounded-2xl border border-[#E9F0EC]/15 px-5 py-3 flex items-center gap-3 backdrop-blur-sm">
                  <span className="text-xl font-semibold">18+</span>
                  <span className="text-[11px] leading-tight text-[#E9F0EC]/55">
                    active
                    <br />
                    research lines
                  </span>
                </div>
              </div>

              <div className="hero-eyebrow text-xs tracking-[0.2em] uppercase text-[#3EBD8F] mb-4">
                Precision Drug Discovery
              </div>

              <h1 className="text-[clamp(2.6rem,5vw,4.2rem)] leading-[1.05] font-semibold mb-6">
                <SplitReveal as="span" text="Where structure" className="block" delay={0.05} />
                <SplitReveal as="span" text="becomes certainty." className="block" delay={0.15} />
              </h1>

              <p className="hero-body max-w-md text-[15px] leading-relaxed text-[#E9F0EC]/55 mb-8 font-light">
                We turn molecular structure into validated drug targets — resolving the
                pathways behind disease so every candidate we advance is built on
                evidence, not probability.
              </p>

              <div className="hero-actions flex flex-wrap items-center gap-4">
                <Magnetic>
                  <button className="rounded-full bg-[#3EBD8F] text-[#0E1512] px-7 py-3.5 text-sm font-medium flex items-center gap-2 hover:gap-3 transition-all">
                    Learn More <span>→</span>
                  </button>
                </Magnetic>
                <div className="flex gap-2 flex-wrap">
                  {["small molecule", "biologics", "target discovery"].map((t) => (
                    <span key={t} className="rounded-full border border-[#E9F0EC]/15 px-4 py-2 text-xs text-[#E9F0EC]/45 backdrop-blur-sm">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-6 md:right-10 flex items-center gap-2 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3EBD8F] animate-pulse" />
            <span className="text-[10px] tracking-[0.18em] uppercase text-[#E9F0EC]/35">Live resolution</span>
          </div>
        </section>

        {/* ABOUT / INNOVATION */}
        <section
          id="about"
          className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24 grid md:grid-cols-2 gap-14 items-center border-t border-white/5"
        >
          <Reveal>
            <div className="text-xs tracking-[0.2em] uppercase text-[#3EBD8F] mb-4">01 — Innovation</div>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-tight mb-6">
              Discovery built on precision, not probability.
            </h2>
            <p className="text-[15px] leading-relaxed text-[#E9F0EC]/55 font-light max-w-lg">
              Most discovery pipelines chase statistical correlation — screen enough
              compounds and hope something sticks. We work backward from structure
              instead: resolving how a target actually behaves at the molecular
              level, so every candidate that reaches the lab bench already has a
              mechanistic reason to work.
            </p>
          </Reveal>
          <Reveal
            delay={0.15}
            stagger={0.08}
            className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 grid grid-cols-2 gap-6"
          >
            {["Structure-first targeting", "Mechanistic validation", "Reproducible pipelines", "Open data standards"].map(
              (t) => (
                <div key={t} className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#3EBD8F] mt-1.5 shrink-0" />
                  <span className="text-sm text-[#E9F0EC]/70">{t}</span>
                </div>
              )
            )}
          </Reveal>
        </section>

        {/* RESOLUTION — interactive proof of the core claim */}
        <section id="resolution" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24 border-t border-white/5">
          <Reveal className="mb-10 max-w-2xl">
            <div className="text-xs tracking-[0.2em] uppercase text-[#3EBD8F] mb-4">02 — Resolution</div>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-tight mb-5">
              Drag the line. That&apos;s the whole pitch.
            </h2>
            <p className="text-[15px] leading-relaxed text-[#E9F0EC]/55 font-light">
              Every pipeline starts with noisy signal — thousands of weak
              correlations with no mechanism behind them. Ours resolves that
              noise into a validated structural map before a candidate ever
              reaches synthesis.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <ResolutionSlider accent="#3EBD8F" />
          </Reveal>
        </section>

        {/* PLATFORM — interactive 3D molecule */}
        <section id="platform" className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24 border-t border-white/5 grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div className="text-xs tracking-[0.2em] uppercase text-[#3EBD8F] mb-4">03 — Platform</div>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold leading-tight mb-5">
              Every candidate, modeled at atomic resolution.
            </h2>
            <p className="text-[15px] leading-relaxed text-[#E9F0EC]/55 font-light max-w-lg mb-6">
              This is the same structural render our teams work from —
              binding geometry, ring strain, and substituent placement
              checked before a compound ever reaches the bench.
            </p>
            <div className="flex gap-2 flex-wrap">
              {["ball-and-stick render", "orbit to inspect", "structure-first"].map((t) => (
                <span key={t} className="rounded-full border border-[#E9F0EC]/15 px-4 py-2 text-xs text-[#E9F0EC]/45">
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-[2.5rem] bg-white/[0.04] border border-white/10 aspect-square w-full max-w-[460px] mx-auto overflow-hidden">
              <Molecule3D className="w-full h-full" accent="#3EBD8F" />
            </div>
          </Reveal>
        </section>

        {/* TECHNOLOGY / RESEARCH — pinned, lattice rotates as you scroll through */}
        <section
          id="research"
          ref={researchSectionRef}
          className="relative z-10 min-h-screen flex flex-col justify-center px-6 md:px-10 border-t border-white/5 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto w-full">
            <Reveal className="text-center mb-12">
              <div className="text-xs tracking-[0.2em] uppercase text-[#3EBD8F] mb-4">04 — Research</div>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold">Six domains. One connected pipeline.</h2>
              <p className="text-xs text-[#E9F0EC]/35 mt-3">Scroll — the map keeps resolving.</p>
            </Reveal>
            <div className="flex items-center justify-center mb-12">
              <Lattice size={340} groupRefExternal={researchGroupRef} />
            </div>
            <Marquee items={domains} className="max-w-3xl mx-auto" />
          </div>
        </section>

        {/* CAPABILITIES / SERVICES */}
        <section
          id="services"
          className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 py-24 border-t border-white/5"
        >
          <Reveal className="mb-14">
            <div className="text-xs tracking-[0.2em] uppercase text-[#3EBD8F] mb-4">05 — Capabilities</div>
            <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold max-w-xl">
              Full-pipeline capability, from target to candidate.
            </h2>
          </Reveal>
          <Reveal stagger={0.12} className="grid md:grid-cols-2 gap-5">
            {services.map((s, i) => (
              <TiltCard
                key={s.title}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 h-full hover:bg-white/[0.05] hover:border-[#3EBD8F]/30 transition-colors duration-300"
              >
                <div className="text-[#3EBD8F] text-xs font-mono mb-4">0{i + 1}</div>
                <h3 className="text-lg font-semibold mb-3">{s.title}</h3>
                <p className="text-sm text-[#E9F0EC]/50 leading-relaxed font-light">{s.desc}</p>
              </TiltCard>
            ))}
          </Reveal>
        </section>

        {/* STATISTICS / IMPACT */}
        <section id="impact" className="relative z-10 border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto px-6 md:px-10 py-24">
            <Reveal className="mb-14 text-center">
              <div className="text-xs tracking-[0.2em] uppercase text-[#3EBD8F] mb-4">06 — Impact</div>
              <h2 className="text-[clamp(2rem,3.5vw,3rem)] font-semibold">Numbers that hold up to scrutiny.</h2>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <Counter value={s.value} className="text-4xl md:text-5xl font-semibold text-[#3EBD8F] mb-2" />
                  <div className="text-xs text-[#E9F0EC]/45 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative z-10 max-w-5xl mx-auto px-6 md:px-10 py-28 text-center">
          <Reveal>
            <h2 className="text-[clamp(2rem,4vw,3.2rem)] font-semibold mb-6">
              Ready to see your next target
              <br />
              in a new resolution?
            </h2>
            <p className="text-[15px] text-[#E9F0EC]/50 font-light mb-10 max-w-md mx-auto">
              Join the discovery teams already mapping certainty into their pipeline.
            </p>
            <Magnetic className="inline-block">
              <button className="rounded-full bg-[#3EBD8F] text-[#0E1512] px-8 py-4 text-sm font-medium hover:brightness-110 transition-all">
                Start Your Research →
              </button>
            </Magnetic>
          </Reveal>
        </section>

        <footer className="relative z-10 border-t border-white/5 px-6 md:px-10 py-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#E9F0EC]/35">
          <span>© 2026 Vantar Bio. All rights reserved.</span>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </footer>
      </div>
    </>
  );
}
