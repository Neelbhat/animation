"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Atom = { pos: [number, number, number]; kind: "core" | "hetero" | "terminal" };
type Bond = { a: number; b: number; order?: 1 | 2 };

/*
 * A stylized, illustrative small-molecule scaffold — not a real
 * compound. Hexagonal core with branching substituents, built for
 * visual weight rather than chemical accuracy.
 */
const ATOMS: Atom[] = [
  { pos: [0, 0.9, 0], kind: "core" },
  { pos: [0.78, 0.45, 0.3], kind: "core" },
  { pos: [0.78, -0.45, -0.3], kind: "core" },
  { pos: [0, -0.9, 0], kind: "core" },
  { pos: [-0.78, -0.45, 0.3], kind: "core" },
  { pos: [-0.78, 0.45, -0.3], kind: "core" },
  { pos: [0, 1.9, 0.5], kind: "hetero" },
  { pos: [1.7, 0.9, 0.6], kind: "core" },
  { pos: [2.5, 1.4, 0.2], kind: "hetero" },
  { pos: [1.75, -0.95, -0.9], kind: "hetero" },
  { pos: [-1.7, -0.95, 0.9], kind: "core" },
  { pos: [-2.5, -1.55, 1.3], kind: "terminal" },
  { pos: [-2.5, -0.5, 1.9], kind: "terminal" },
  { pos: [-1.65, 1.0, -1.05], kind: "hetero" },
];

const BONDS: Bond[] = [
  { a: 0, b: 1, order: 2 },
  { a: 1, b: 2 },
  { a: 2, b: 3, order: 2 },
  { a: 3, b: 4 },
  { a: 4, b: 5, order: 2 },
  { a: 5, b: 0 },
  { a: 0, b: 6 },
  { a: 1, b: 7 },
  { a: 7, b: 8, order: 2 },
  { a: 2, b: 9 },
  { a: 4, b: 10 },
  { a: 10, b: 11 },
  { a: 10, b: 12 },
  { a: 5, b: 13 },
];

export default function Molecule3D({
  className = "",
  accent = "#3EBD8F",
}: {
  className?: string;
  accent?: string;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.4, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    mount.appendChild(renderer.domElement);

    const accentColor = new THREE.Color(accent);
    const coreColor = new THREE.Color("#E9F0EC");
    const bondColor = new THREE.Color("#4B5B54");

    const group = new THREE.Group();
    scene.add(group);

    const sphereGeo = new THREE.SphereGeometry(1, 24, 24);
    const atomMeshes: THREE.Mesh[] = ATOMS.map((atom) => {
      const isCore = atom.kind === "core";
      const isTerminal = atom.kind === "terminal";
      const mat = new THREE.MeshStandardMaterial({
        color: isCore ? coreColor : accentColor,
        roughness: 0.38,
        metalness: 0.12,
        emissive: isCore ? new THREE.Color("#000000") : accentColor,
        emissiveIntensity: isCore ? 0 : 0.18,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      const scale = isTerminal ? 0.19 : isCore ? 0.26 : 0.22;
      mesh.scale.setScalar(scale);
      mesh.position.set(...atom.pos);
      group.add(mesh);
      return mesh;
    });

    const bondGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 10);
    const bondMat = new THREE.MeshStandardMaterial({
      color: bondColor,
      roughness: 0.5,
      metalness: 0.05,
    });

    function addBond(pa: THREE.Vector3, pb: THREE.Vector3, offset = 0) {
      const dir = new THREE.Vector3().subVectors(pb, pa);
      const len = dir.length();
      const mid = new THREE.Vector3().addVectors(pa, pb).multiplyScalar(0.5);
      const mesh = new THREE.Mesh(bondGeo, bondMat);
      mesh.scale.set(1, len, 1);
      mesh.position.copy(mid);
      if (offset !== 0) {
        const normal = new THREE.Vector3(-dir.y, dir.x, dir.z * 0.4).normalize();
        mesh.position.addScaledVector(normal, offset);
      }
      const axis = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(axis, dir.clone().normalize());
      mesh.quaternion.copy(quat);
      group.add(mesh);
    }

    BONDS.forEach((bond) => {
      const pa = new THREE.Vector3(...ATOMS[bond.a].pos);
      const pb = new THREE.Vector3(...ATOMS[bond.b].pos);
      if (bond.order === 2) {
        addBond(pa, pb, 0.09);
        addBond(pa, pb, -0.09);
      } else {
        addBond(pa, pb, 0);
      }
    });

    group.rotation.set(0.15, -0.4, 0.05);

    scene.add(new THREE.AmbientLight("#ffffff", 0.55));
    const key = new THREE.DirectionalLight("#ffffff", 1.1);
    key.position.set(4, 5, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(accent, 0.5);
    fill.position.set(-5, -2, -4);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 1.1;
    controls.addEventListener("start", () => {
      setHint(false);
      controls.autoRotate = false;
    });

    // Scroll-scrubbed spin: rotates the molecule itself (independent of the
    // camera orbit controls above) as the section moves through view, so
    // scrolling past it feels like turning the model in your hand.
    let scrollTween: gsap.core.Tween | null = null;
    if (!reduceMotion) {
      scrollTween = gsap.to(group.rotation, {
        y: group.rotation.y + Math.PI * 1.6,
        x: group.rotation.x + 0.35,
        ease: "none",
        scrollTrigger: {
          trigger: mount,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      });
    }

    function resize() {
      const rect = mount!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    function tick(t: number) {
      controls.update();
      if (!reduceMotion) {
        group.position.y = Math.sin(t * 0.0009) * 0.09;
      }
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      scrollTween?.scrollTrigger?.kill();
      scrollTween?.kill();
      controls.dispose();
      sphereGeo.dispose();
      bondGeo.dispose();
      bondMat.dispose();
      atomMeshes.forEach((m) => (m.material as THREE.Material).dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount!.removeChild(renderer.domElement);
      }
    };
  }, [accent]);

  return (
    <div
      ref={mountRef}
      className={`relative touch-none ${className}`}
      role="img"
      aria-label="Interactive 3D model of a small-molecule drug candidate scaffold"
    >
      {hint && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.16em] uppercase text-[#E9F0EC]/35 pointer-events-none">
          Drag to rotate
        </div>
      )}
    </div>
  );
}
