"use client";

import { useEffect, useRef } from "react";
import rawParticles from "../data/particles.json";

const PARTICLE_COUNT = 7000;
const colors = ["#ffb829", "#15846e", "#8052ff", "#ffffff"]; // Sorted from bottom to top
const shapes = ["circle", "triangle", "diamond", "square"] as const;

type Shape = (typeof shapes)[number];

interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: Shape;
  opacity: number;
  springFactor: number;
  damping: number;
  driftOffset: number;
  scaleFactor: number; // Computed dynamically based on depth
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

export default function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const mouse = { x: -1000, y: -1000, active: false, radius: 100 };
    let mouseInfluenceX = 0;
    let mouseInfluenceY = 0;
    let mouseVx = 0;
    let mouseVy = 0;
    let prevMouseX = -1000;
    let prevMouseY = -1000;

    let gyroX = 0;
    let gyroY = 0;
    let hasGyro = false;

    // ─── 3D Coordinates Setup ──────────────────────────────────────────────
    // Extract the coordinates for the four 3D shapes from the JSON.
    const sortedBrain = [...rawParticles.brain].slice(0, PARTICLE_COUNT);
    const sortedLightbulb = [...rawParticles.lightbulb].slice(0, PARTICLE_COUNT);
    const sortedSphere = [...rawParticles.sphere].slice(0, PARTICLE_COUNT);

    // Generate random 3D points for Scattered state
    const sortedScattered: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sortedScattered.push({
        x: randomRange(-2.0, 2.0),
        y: randomRange(-1.2, 1.2),
        z: randomRange(-0.8, 0.8),
      });
    }

    // Sort all shapes by Y ascending (bottom-to-top in 3D space)
    // This aligns the vertical color bands across all morph transitions.
    sortedBrain.sort((a, b) => a.y - b.y);
    sortedLightbulb.sort((a, b) => a.y - b.y);
    sortedSphere.sort((a, b) => a.y - b.y);
    sortedScattered.sort((a, b) => a.y - b.y);

    // ─── Init Particles ───────────────────────────────────────────────────
    const particles: ParticleData[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: randomRange(0, W),
        y: randomRange(0, H),
        vx: 0,
        vy: 0,
        size: randomRange(1.8, 4.2),
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: randomRange(0.2, 0.95),
        springFactor: randomRange(0.015, 0.04),
        damping: randomRange(0.85, 0.92),
        driftOffset: randomRange(0, 1000),
        scaleFactor: 1.0,
      });
    }

    // Sort particles so their colors match the sorted 3D coordinates
    const colorOrder = ["#ffb829", "#15846e", "#8052ff", "#ffffff"];
    particles.sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color));

    // Pre-render shaded sphere sprites for each color to maximize performance
    const sprites: { [color: string]: HTMLCanvasElement } = {};
    const spriteSize = 32;

    colors.forEach((color) => {
      const offscreen = document.createElement("canvas");
      offscreen.width = spriteSize;
      offscreen.height = spriteSize;
      const octx = offscreen.getContext("2d");
      if (octx) {
        const r = spriteSize / 2;
        // Radial gradient with highlight offset to top-left
        const grad = octx.createRadialGradient(
          r - r * 0.3,
          r - r * 0.3,
          r * 0.1,
          r,
          r,
          r
        );
        grad.addColorStop(0, "#ffffff"); // Highlight spot
        grad.addColorStop(0.15, color);  // Main color
        grad.addColorStop(0.95, color);  // Edge color
        grad.addColorStop(1.0, "rgba(0, 0, 0, 0)"); // Alpha falloff at edge

        octx.fillStyle = grad;
        octx.beginPath();
        octx.arc(r, r, r, 0, Math.PI * 2);
        octx.fill();
      }
      sprites[color] = offscreen;
    });

    const startTime = Date.now();
    let animId: number;

    function animate() {
      ctx!.clearRect(0, 0, W, H);
      const elapsed = Date.now() - startTime;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      const isMobile = W < 768;
      const brainCenter = {
        x: isMobile ? W * 0.5 : W * 0.72,
        y: isMobile ? H * 0.35 : H * 0.5,
      };
      const sporeCenter = { x: W * 0.5, y: isMobile ? H * 0.3 : H * 0.5 };

      // ─── 3D Rotation angles over time ──────────────────────────────────────
      const time = elapsed * 0.00015;

      // Track mouse velocity for interactive wave ripple distortion
      if (mouse.active) {
        if (prevMouseX !== -1000) {
          mouseVx = mouse.x - prevMouseX;
          mouseVy = mouse.y - prevMouseY;
        }
        prevMouseX = mouse.x;
        prevMouseY = mouse.y;
      } else {
        mouseVx = 0;
        mouseVy = 0;
        prevMouseX = -1000;
        prevMouseY = -1000;
      }

      let targetInfluenceX = 0;
      let targetInfluenceY = 0;
      if (hasGyro) {
        targetInfluenceX = gyroX;
        targetInfluenceY = gyroY;
      } else if (mouse.active) {
        // Dampen cursor rotation coefficients to 33% of original (Y: 0.06, X: 0.04)
        targetInfluenceX = ((mouse.x - W / 2) / (W / 2)) * 0.06;
        targetInfluenceY = ((mouse.y - H / 2) / (H / 2)) * 0.04;
      }
      mouseInfluenceX += (targetInfluenceX - mouseInfluenceX) * 0.05;
      mouseInfluenceY += (targetInfluenceY - mouseInfluenceY) * 0.05;

      // Start slightly sideways (45-deg / 1.2 rad) and rotate extremely slowly (0.12)
      const rotateY = 1.60 + time * 0.12 + mouseInfluenceX;
      const rotateX = 0.25 + Math.sin(time * 0.15) * 0.05 + mouseInfluenceY; // very gentle nod
      const rotateZ = Math.cos(time * 0.12) * 0.03; // very gentle tilt

      particles.forEach((p, i) => {
        const b = sortedBrain[i] || { x: 0, y: 0, z: 0 };
        const l = sortedLightbulb[i] || { x: 0, y: 0, z: 0 };
        const s = sortedSphere[i] || { x: 0, y: 0, z: 0 };
        const sc = sortedScattered[i] || { x: 0, y: 0, z: 0 };

        // 1. Interpolate coordinates in 3D space first (smoother morphs)
        let rx: number, ry: number, rz: number;

        if (scrollRatio < 0.20) {
          // Hero & Intro: Brain
          rx = b.x; ry = b.y; rz = b.z;
        } else if (scrollRatio < 0.30) {
          // Transition: Brain -> Lightbulb
          const t = (scrollRatio - 0.20) / 0.10;
          rx = lerp(b.x, l.x, t);
          ry = lerp(b.y, l.y, t);
          rz = lerp(b.z, l.z, t);
        } else if (scrollRatio < 0.45) {
          // Solutions: Lightbulb
          rx = l.x; ry = l.y; rz = l.z;
        } else if (scrollRatio < 0.55) {
          // Transition: Lightbulb -> Sphere / Globe
          const t = (scrollRatio - 0.45) / 0.10;
          rx = lerp(l.x, s.x, t);
          ry = lerp(l.y, s.y, t);
          rz = lerp(l.z, s.z, t);
        } else if (scrollRatio < 0.70) {
          // Mission: Sphere / Globe
          rx = s.x; ry = s.y; rz = s.z;
        } else if (scrollRatio < 0.80) {
          // Transition: Sphere -> Scattered
          const t = (scrollRatio - 0.70) / 0.10;
          rx = lerp(s.x, sc.x, t);
          ry = lerp(s.y, sc.y, t);
          rz = lerp(s.z, sc.z, t);
        } else {
          // Scattered (Drift)
          rx = sc.x; ry = sc.y; rz = sc.z;
        }

        // 2. Apply 3D Rotation Matrices
        // Y-axis rotation
        const cosY = Math.cos(rotateY);
        const sinY = Math.sin(rotateY);
        let x1 = rx * cosY - rz * sinY;
        let z1 = rx * sinY + rz * cosY;

        // X-axis rotation
        const cosX = Math.cos(rotateX);
        const sinX = Math.sin(rotateX);
        let y1 = ry * cosX - z1 * sinX;
        let z2 = ry * sinX + z1 * cosX;

        // Z-axis rotation
        const cosZ = Math.cos(rotateZ);
        const sinZ = Math.sin(rotateZ);
        let x2 = x1 * cosZ - y1 * sinZ;
        let y2 = x1 * sinZ + y1 * cosZ;

        // 3. Perspective Projection Setup
        const fov = 400;
        const perspective = fov / Math.max(50, fov + z2 * 250);
        p.scaleFactor = perspective;

        // 4. Determine center-anchor and scale based on scroll position
        let cx = brainCenter.x;
        let cy = brainCenter.y;
        let baseScale = isMobile ? 320 : 445;

        if (scrollRatio < 0.20) {
          cx = brainCenter.x;
          cy = brainCenter.y;
          // Enlarge initial brain (desktop 550, mobile 400)
          baseScale = isMobile ? 400 : 550;
        } else if (scrollRatio < 0.30) {
          const t1 = (scrollRatio - 0.20) / 0.10;
          cx = lerp(brainCenter.x, sporeCenter.x, t1);
          cy = lerp(brainCenter.y, sporeCenter.y, t1);
          // Smoothly scale down to standard sizes
          const initialScale = isMobile ? 400 : 550;
          const standardScale = isMobile ? 320 : 445;
          baseScale = lerp(initialScale, standardScale, t1);
        } else {
          cx = sporeCenter.x;
          cy = sporeCenter.y;
        }

        const scale = baseScale * perspective;
        let targetX = cx + x2 * scale;
        let targetY = cy - y2 * scale; // Invert Y since screen coordinate Y runs downward

        // Wave animation helper for scattered / floating space dust phase
        if (scrollRatio >= 0.70) {
          const waveTime = Date.now() * 0.001 + p.driftOffset;
          targetY += Math.sin(waveTime) * 15;
        }

        // 5. Spring Physics
        const ax = (targetX - p.x) * p.springFactor;
        const ay = (targetY - p.y) * p.springFactor;
        p.vx = (p.vx + ax) * p.damping;
        p.vy = (p.vy + ay) * p.damping;

        p.x += p.vx;
        p.y += p.vy;

        // 6. Oscillatory mouse wave ripple distortion (positional shift)
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            // Normalized distance smoothstep (1 at mouse, 0 at boundary)
            const factor = (120 - dist) / 120;
            const smoothFactor = factor * factor * (3 - 2 * factor);

            // Decoupled wave time using particle driftOffset
            const waveTime = Date.now() * 0.005 + p.driftOffset;

            // Volumetric breathing ripple, amplified by mouse velocity
            const waveX = Math.sin(waveTime) * (2.0 + Math.abs(mouseVx) * 1.5) * smoothFactor;
            const waveY = Math.cos(waveTime) * (2.0 + Math.abs(mouseVy) * 1.5) * smoothFactor;

            p.x += waveX;
            p.y += waveY;
          }
        }
      });

      // ─── Render Shaded 3D Spheres (Circles) ───────────────────────────────
      particles.forEach((p) => {
        if (p.shape !== "circle") return;
        const size = p.size * p.scaleFactor;
        const sprite = sprites[p.color];
        if (sprite) {
          ctx!.drawImage(
            sprite,
            p.x - size / 2,
            p.y - size / 2,
            size,
            size
          );
        }
      });

      // ─── Batch Render Other Vector Shapes (Triangle, Diamond, Square) ─────
      ctx!.globalAlpha = 0.68;
      colors.forEach((color) => {
        shapes.forEach((shape) => {
          if (shape === "circle") return; // Already drawn as 3D spheres!

          ctx!.fillStyle = color;
          ctx!.beginPath();

          particles.forEach((p) => {
            if (p.color !== color || p.shape !== shape) return;

            const size = p.size * p.scaleFactor;
            const halfSize = size / 2;

            switch (shape) {
              case "triangle":
                ctx!.moveTo(p.x, p.y - halfSize);
                ctx!.lineTo(p.x - halfSize, p.y + halfSize);
                ctx!.lineTo(p.x + halfSize, p.y + halfSize);
                ctx!.closePath();
                break;
              case "diamond":
                ctx!.moveTo(p.x, p.y - halfSize);
                ctx!.lineTo(p.x + halfSize, p.y);
                ctx!.lineTo(p.x, p.y + halfSize);
                ctx!.lineTo(p.x - halfSize, p.y);
                ctx!.closePath();
                break;
              case "square":
                ctx!.rect(p.x - halfSize, p.y - halfSize, size, size);
                break;
            }
          });

          ctx!.fill();
        });
      });

      ctx!.globalAlpha = 1.0;
      animId = requestAnimationFrame(animate);
    }

    animId = requestAnimationFrame(animate);

    // ─── Event Listeners ──────────────────────────────────────────────────
    const handleResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        hasGyro = true;
        const gammaClamped = Math.max(-30, Math.min(30, e.gamma));
        const betaClamped = Math.max(-30, Math.min(30, e.beta - 60));

        gyroX = (gammaClamped / 30) * 0.30;
        gyroY = (betaClamped / 30) * 0.20;
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("deviceorientation", handleOrientation);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} id="particle-canvas" />
    </div>
  );
}
