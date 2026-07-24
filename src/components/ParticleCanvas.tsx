"use client";

import { useEffect, useRef } from "react";
import rawParticles from "../data/particles.json";
import { type AppSettings } from "../types";

const PARTICLE_COUNT = 7000;
const shapes = ["circle", "triangle", "diamond", "square"] as const;

type Shape = (typeof shapes)[number];

interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  colorIndex: number;
  shape: Shape;
  opacity: number;
  springFactor: number;
  damping: number;
  driftOffset: number;
  scaleFactor: number;
}

interface ParticleCanvasProps {
  settings: AppSettings;
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function lerp(start: number, end: number, t: number) {
  return start * (1 - t) + end * t;
}

export default function ParticleCanvas({ settings }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef<AppSettings>(settings);

  // Sync settings updates to ref without re-triggering main useEffect hook
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const mouse = { x: -1000, y: -1000, active: false };
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
    const sortedBrain = [...rawParticles.brain].slice(0, PARTICLE_COUNT);
    // Expand lightbulb by 1.25 and rotate -45 degrees around X-axis
    const angle45 = -Math.PI / 4; // -45 degrees in radians
    const cos45 = Math.cos(angle45);
    const sin45 = Math.sin(angle45);
    const sortedLightbulb = [...rawParticles.lightbulb].slice(0, PARTICLE_COUNT).map((p) => {
      const ex = p.x * 1.25;
      const ey = p.y * 1.25;
      const ez = p.z * 1.25;
      return {
        x: ex,
        y: ey * cos45 - ez * sin45,
        z: ey * sin45 + ez * cos45,
      };
    });
    // Programmatic 3D Sphere Generator (100% outline as alternating latitude/longitude lines, no face/surface fill)
    const sortedSphere: { x: number; y: number; z: number }[] = new Array(PARTICLE_COUNT);
    const sphereRadius = 0.45;

    const N_lat = 10; // 10 latitude lines
    const N_lon = 12; // 12 longitude lines

    for (let c = 0; c < 4; c++) {
      const bandStart = c * 1750;

      // Generate all 1750 particles as outlines
      for (let i = 0; i < 1750; i++) {
        let x = 0, y = 0, z = 0;

        if (c === 0 || c === 1) {
          // Latitudes: Color 0 even lines, Color 1 odd lines
          const availableIndices = [];
          for (let k = 1; k <= N_lat; k++) {
            if (c === 0 && k % 2 === 0) availableIndices.push(k);
            if (c === 1 && k % 2 !== 0) availableIndices.push(k);
          }
          const k = availableIndices[i % availableIndices.length];
          const phi = (k / (N_lat + 1)) * Math.PI;
          const theta = Math.random() * Math.PI * 2;

          x = Math.sin(phi) * Math.cos(theta);
          y = Math.cos(phi); // Y is vertical axis
          z = Math.sin(phi) * Math.sin(theta);
        } else {
          // Longitudes: Color 2 even lines, Color 3 odd lines
          const availableIndices = [];
          for (let j = 0; j < N_lon; j++) {
            if (c === 2 && j % 2 === 0) availableIndices.push(j);
            if (c === 3 && j % 2 !== 0) availableIndices.push(j);
          }
          const j = availableIndices[i % availableIndices.length];
          const theta = (j / N_lon) * Math.PI * 2;
          const phi = Math.random() * Math.PI;

          x = Math.sin(phi) * Math.cos(theta);
          y = Math.cos(phi); // Y is vertical axis
          z = Math.sin(phi) * Math.sin(theta);
        }

        // Add noise
        const noise = 0.015;
        x += randomRange(-noise, noise);
        y += randomRange(-noise, noise);
        z += randomRange(-noise, noise);

        sortedSphere[bandStart + i] = {
          x: x * sphereRadius,
          y: y * sphereRadius,
          z: z * sphereRadius
        };
      }
    }

    // 1. Programmatic 3D Cube Generator (hollow, with distinct edge outlines and solid-colored edges)
    const sortedCube: { x: number; y: number; z: number }[] = new Array(PARTICLE_COUNT);
    const fillIndices: number[] = [];
    const fillCoordinates: { x: number; y: number; z: number }[] = [];

    // Define 4 alternate (non-adjacent) corners of the cube to assign adjacent edges to colors
    const corners = [
      { x: 1.0, y: 1.0, z: 1.0 },   // Corner 0
      { x: 1.0, y: -1.0, z: -1.0 }, // Corner 1
      { x: -1.0, y: 1.0, z: -1.0 }, // Corner 2
      { x: -1.0, y: -1.0, z: 1.0 }  // Corner 3
    ];

    // Generate edge and fill coordinates
    for (let c = 0; c < 4; c++) {
      const bandStart = c * 1750;
      const corner = corners[c];

      // A: Generate edge particles (1312 particles)
      for (let i = 0; i < 1312; i++) {
        const edgeIndex = i % 3;
        const t = randomRange(-1.0, 1.0);
        let x = 0, y = 0, z = 0;

        if (edgeIndex === 0) {
          x = t;
          y = corner.y;
          z = corner.z;
        } else if (edgeIndex === 1) {
          x = corner.x;
          y = t;
          z = corner.z;
        } else {
          x = corner.x;
          y = corner.y;
          z = t;
        }

        // Add noise
        const noise = 0.025;
        x += randomRange(-noise, noise);
        y += randomRange(-noise, noise);
        z += randomRange(-noise, noise);

        sortedCube[bandStart + i] = {
          x: x * 0.42,
          y: y * 0.42,
          z: z * 0.42
        };
      }

      // B: Generate fill particles (438 particles)
      for (let i = 1312; i < 1750; i++) {
        const idx = bandStart + i;
        fillIndices.push(idx);

        const face = i % 6;
        let x = randomRange(-1.0, 1.0);
        let y = randomRange(-1.0, 1.0);
        let z = randomRange(-1.0, 1.0);
        if (face === 0) x = -1.0;
        else if (face === 1) x = 1.0;
        else if (face === 2) y = -1.0;
        else if (face === 3) y = 1.0;
        else if (face === 4) z = -1.0;
        else if (face === 5) z = 1.0;

        // Add noise
        const noise = 0.025;
        x += randomRange(-noise, noise);
        y += randomRange(-noise, noise);
        z += randomRange(-noise, noise);

        fillCoordinates.push({
          x: x * 0.42,
          y: y * 0.42,
          z: z * 0.42
        });
      }
    }

    // Shuffle the fill coordinates so that fill colors are randomly mixed and scattered
    for (let i = fillCoordinates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = fillCoordinates[i];
      fillCoordinates[i] = fillCoordinates[j];
      fillCoordinates[j] = temp;
    }

    // Put shuffled fill coordinates back into their reserved slots in sortedCube
    for (let i = 0; i < fillIndices.length; i++) {
      sortedCube[fillIndices[i]] = fillCoordinates[i];
    }

    // 2. Programmatic 3D Torus Generator (with slight organic noise)
    const sortedTorus: { x: number; y: number; z: number }[] = [];
    const R_torus = 0.75;
    const r_torus = 0.22;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      let x = (R_torus + r_torus * Math.cos(phi)) * Math.cos(theta);
      let y = (R_torus + r_torus * Math.cos(phi)) * Math.sin(theta);
      let z = r_torus * Math.sin(phi);

      // Add noise
      const noise = 0.02;
      x += randomRange(-noise, noise);
      y += randomRange(-noise, noise);
      z += randomRange(-noise, noise);

      // Rotate by 90 degrees around Y-axis sideways (swap x and z)
      sortedTorus.push({ x: z, y: y * 0.95, z: -x });
    }
    // Shuffle the torus coordinates so that colors are randomly mixed and scattered rather than height-banded
    for (let i = sortedTorus.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = sortedTorus[i];
      sortedTorus[i] = sortedTorus[j];
      sortedTorus[j] = temp;
    }

    // 3. Programmatic DNA Double Helix Generator
    const sortedDNA: { x: number; y: number; z: number }[] = [];
    const helixRadius = 0.52;
    const helixHeight = 1.6;
    const turns = 2.0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const isStrand = Math.random() < 0.7;
      const strandIndex = i % 2;
      const pct = Math.random();
      const y = pct * helixHeight - (helixHeight / 2);
      const angle = pct * turns * Math.PI * 2 + (strandIndex * Math.PI);
      let x = 0;
      let z = 0;
      if (isStrand) {
        x = Math.cos(angle) * helixRadius;
        z = Math.sin(angle) * helixRadius;
      } else {
        const t_rung = randomRange(-1.0, 1.0);
        x = Math.cos(pct * turns * Math.PI * 2) * helixRadius * t_rung;
        z = Math.sin(pct * turns * Math.PI * 2) * helixRadius * t_rung;
      }
      const n = 0.02;
      sortedDNA.push({
        x: x + randomRange(-n, n),
        y: y + randomRange(-n, n),
        z: z + randomRange(-n, n),
      });
    }

    // 4. Programmatic 3D Octahedron/Pyramid Generator (with distinct edge outlines and solid-colored edges)
    const sortedPyramid: { x: number; y: number; z: number }[] = new Array(PARTICLE_COUNT);
    const pyrScale = 0.85;

    // Vertices of the Octahedron
    const vertices = [
      { x: 1.0, y: 0.0, z: 0.0 },   // V0
      { x: -1.0, y: 0.0, z: 0.0 },  // V1
      { x: 0.0, y: 1.0, z: 0.0 },   // V2
      { x: 0.0, y: -1.0, z: 0.0 },  // V3
      { x: 0.0, y: 0.0, z: 1.0 },   // V4
      { x: 0.0, y: 0.0, z: -1.0 }   // V5
    ];

    // Partition edges into 4 groups of 3 adjacent edges meeting at a vertex:
    const octahedronColorGroups = [
      [[4, 0], [4, 1], [4, 2]], // Group 0 (meets at V4)
      [[5, 0], [5, 1], [5, 3]], // Group 1 (meets at V5)
      [[2, 1], [2, 0], [2, 5]], // Group 2 (meets at V2)
      [[3, 0], [3, 1], [3, 4]]  // Group 3 (meets at V3)
    ];

    const pyrFillIndices: number[] = [];
    const pyrFillCoordinates: { x: number; y: number; z: number }[] = [];

    // Generate edge and fill coordinates for Octahedron
    for (let c = 0; c < 4; c++) {
      const bandStart = c * 1750;

      // A: Generate edge particles (1312 particles)
      for (let i = 0; i < 1312; i++) {
        const edge = octahedronColorGroups[c][i % 3];
        const v1 = vertices[edge[0]];
        const v2 = vertices[edge[1]];
        const t = Math.random();
        let x = v1.x + t * (v2.x - v1.x);
        let y = v1.y + t * (v2.y - v1.y);
        let z = v1.z + t * (v2.z - v1.z);

        // Add noise
        const n = 0.025;
        x += randomRange(-n, n);
        y += randomRange(-n, n);
        z += randomRange(-n, n);

        sortedPyramid[bandStart + i] = {
          x: x * pyrScale,
          y: y * pyrScale,
          z: z * pyrScale
        };
      }

      // B: Generate fill particles (438 particles)
      for (let i = 1312; i < 1750; i++) {
        const idx = bandStart + i;
        pyrFillIndices.push(idx);

        const face = i % 8;
        const xSign = (face & 1) ? 1.0 : -1.0;
        const ySign = (face & 2) ? 1.0 : -1.0;
        const zSign = (face & 4) ? 1.0 : -1.0;
        const A = { x: xSign, y: 0.0, z: 0.0 };
        const B = { x: 0.0, y: ySign, z: 0.0 };
        const C = { x: 0.0, y: 0.0, z: zSign };
        let r1 = Math.random();
        let r2 = Math.random();
        if (r1 + r2 > 1.0) {
          r1 = 1.0 - r1;
          r2 = 1.0 - r2;
        }
        let x = A.x + r1 * (B.x - A.x) + r2 * (C.x - A.x);
        let y = A.y + r1 * (B.y - A.y) + r2 * (C.y - A.y);
        let z = A.z + r1 * (B.z - A.z) + r2 * (C.z - A.z);

        // Add noise
        const n = 0.025;
        x += randomRange(-n, n);
        y += randomRange(-n, n);
        z += randomRange(-n, n);

        pyrFillCoordinates.push({
          x: x * pyrScale,
          y: y * pyrScale,
          z: z * pyrScale
        });
      }
    }

    // Shuffle the fill coordinates so that fill colors are randomly mixed and scattered
    for (let i = pyrFillCoordinates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = pyrFillCoordinates[i];
      pyrFillCoordinates[i] = pyrFillCoordinates[j];
      pyrFillCoordinates[j] = temp;
    }

    // Put shuffled fill coordinates back into their reserved slots in sortedPyramid
    for (let i = 0; i < pyrFillIndices.length; i++) {
      sortedPyramid[pyrFillIndices[i]] = pyrFillCoordinates[i];
    }


    // 5. Programmatic Trefoil Knot Generator
    const sortedTrefoil: { x: number; y: number; z: number }[] = [];
    const trefoilScale = 0.38;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = (i / PARTICLE_COUNT) * Math.PI * 2 * 3;
      const x = Math.sin(t) + 2.0 * Math.sin(2.0 * t);
      const y = Math.cos(t) - 2.0 * Math.cos(2.0 * t);
      const z = -Math.sin(3.0 * t);
      const n = 0.02;
      sortedTrefoil.push({
        x: (x + randomRange(-n, n)) * trefoilScale,
        y: (y + randomRange(-n, n)) * trefoilScale,
        z: (z + randomRange(-n, n)) * trefoilScale,
      });
    }

    // 6. Programmatic 3D Astroid Star Generator
    const sortedAstroid: { x: number; y: number; z: number }[] = [];
    const astroidScale = 0.95;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = randomRange(-Math.PI / 2, Math.PI / 2);
      const v = randomRange(-Math.PI, Math.PI);
      const cosU = Math.cos(u);
      const sinU = Math.sin(u);
      const cosV = Math.cos(v);
      const sinV = Math.sin(v);
      const x = cosU * cosU * cosU * cosV * cosV * cosV;
      const y = sinU * sinU * sinU * cosV * cosV * cosV;
      const z = sinV * sinV * sinV;
      const n = 0.02;
      sortedAstroid.push({
        x: (x + randomRange(-n, n)) * astroidScale,
        y: (y + randomRange(-n, n)) * astroidScale,
        z: (z + randomRange(-n, n)) * astroidScale,
      });
    }

    // 10. Programmatic Scattered Generator
    const sortedScattered: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      sortedScattered.push({
        x: randomRange(-2.0, 2.0),
        y: randomRange(-1.2, 1.2),
        z: randomRange(-0.8, 0.8),
      });
    }
    // Shuffle the scattered coordinates so that colors are randomly mixed and scattered rather than height-banded
    for (let i = sortedScattered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = sortedScattered[i];
      sortedScattered[i] = sortedScattered[j];
      sortedScattered[j] = temp;
    }

    // ─── Polyhedron Sampling Helpers ──────────────────────────────────────────
    // Helper to sample inside a triangle
    function sampleTriangle(
      a: { x: number; y: number; z: number },
      b: { x: number; y: number; z: number },
      c: { x: number; y: number; z: number }
    ) {
      const r1 = Math.random();
      const r2 = Math.random();
      const sqrtR1 = Math.sqrt(r1);
      const u = 1 - sqrtR1;
      const v = r2 * sqrtR1;
      const w = 1 - u - v;
      return {
        x: u * a.x + v * b.x + w * c.x,
        y: u * a.y + v * b.y + w * c.y,
        z: u * a.z + v * b.z + w * c.z,
      };
    }

    // Helper to sample inside a face (triangle, pentagon or pentagram)
    function sampleFace(
      vertices: { x: number; y: number; z: number }[],
      faceIndices: number[],
      isStar: boolean
    ) {
      if (faceIndices.length === 3) {
        return sampleTriangle(vertices[faceIndices[0]], vertices[faceIndices[1]], vertices[faceIndices[2]]);
      } else if (faceIndices.length === 5) {
        const v = faceIndices.map((idx) => vertices[idx]);
        const cx = (v[0].x + v[1].x + v[2].x + v[3].x + v[4].x) / 5;
        const cy = (v[0].y + v[1].y + v[2].y + v[3].y + v[4].y) / 5;
        const cz = (v[0].z + v[1].z + v[2].z + v[3].z + v[4].z) / 5;
        const O = { x: cx, y: cy, z: cz };

        const idx = Math.floor(Math.random() * 5);
        if (isStar) {
          // Pentagram: Connect center O to tips in star winding
          return sampleTriangle(O, v[idx], v[(idx + 2) % 5]);
        } else {
          // Pentagon: Connect center O to adjacent vertices
          return sampleTriangle(O, v[idx], v[(idx + 1) % 5]);
        }
      }
      return { x: 0, y: 0, z: 0 };
    }

    // Helper to sort face indices circularly on a plane in 3D
    function sortFaceCircular(
      face: number[],
      verts: { x: number; y: number; z: number }[]
    ): number[] {
      const p0 = verts[face[0]];
      const p1 = verts[face[1]];
      const p2 = verts[face[2]];

      const ux = p1.x - p0.x, uy = p1.y - p0.y, uz = p1.z - p0.z;
      const vx = p2.x - p0.x, vy = p2.y - p0.y, vz = p2.z - p0.z;

      let nx = uy * vz - uz * vy;
      let ny = uz * ux - ux * vz;
      let nz = ux * vy - uy * vx;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
      nx /= len; ny /= len; nz /= len;

      let tx = 1, ty = 0, tz = 0;
      if (Math.abs(nx) > 0.9) {
        tx = 0; ty = 1;
      }
      const dot = tx * nx + ty * ny + tz * nz;
      const ux_orth = tx - dot * nx;
      const uy_orth = ty - dot * ny;
      const uz_orth = tz - dot * nz;
      const lenU = Math.sqrt(ux_orth * ux_orth + uy_orth * uy_orth + uz_orth * uz_orth);
      const ux_n = ux_orth / lenU, uy_n = uy_orth / lenU, uz_n = uz_orth / lenU;

      const vx_n = ny * uz_n - nz * uy_n;
      const vy_n = nz * ux_n - nx * uz_n;
      const vz_n = nx * uy_n - ny * ux_n;

      let cx = 0, cy = 0, cz = 0;
      for (const idx of face) {
        cx += verts[idx].x;
        cy += verts[idx].y;
        cz += verts[idx].z;
      }
      cx /= 5; cy /= 5; cz /= 5;

      return [...face].sort((a, b) => {
        const va = verts[a];
        const vb = verts[b];
        const ax = (va.x - cx) * ux_n + (va.y - cy) * uy_n + (va.z - cz) * uz_n;
        const ay = (va.x - cx) * vx_n + (va.y - cy) * vy_n + (va.z - cz) * vz_n;
        const bx = (vb.x - cx) * ux_n + (vb.y - cy) * uy_n + (vb.z - cz) * uz_n;
        const by = (vb.x - cx) * vx_n + (vb.y - cy) * vy_n + (vb.z - cz) * vz_n;
        return Math.atan2(ay, ax) - Math.atan2(by, bx);
      });
    }

    // Helper to sort 5 vertices circularly using edge graph cycle (specifically for icosahedron neighbor sets)
    function sortCircular(neighbors: number[], currentId: number, icoEdges: number[][]): number[] {
      const sorted: number[] = [neighbors[0]];
      let current = neighbors[0];
      while (sorted.length < 5) {
        const next = neighbors.find(n => 
          !sorted.includes(n) && 
          icoEdges.some(e => (e[0] === current && e[1] === n) || (e[0] === n && e[1] === current))
        );
        if (next !== undefined) {
          sorted.push(next);
          current = next;
        } else {
          break;
        }
      }
      return sorted;
    }

    // Master Polyhedron Generator
    function generatePolyhedron(
      vertices: { x: number; y: number; z: number }[],
      edges: number[][],
      faces: number[][],
      scale: number,
      isStar: boolean,
      noise: number,
      edgePercent: number
    ): { x: number; y: number; z: number }[] {
      const points: { x: number; y: number; z: number }[] = new Array(7000);

      // Edge and face allocations per band (total 1750 particles per band)
      const bandConfigs: { edgeCounts: number[]; faceCount: number; bandStart: number }[] = [];

      if (edgePercent === 100) {
        // Band 0: 8 edges. 6 with 219, 2 with 218. Face = 0.
        bandConfigs.push({ edgeCounts: [219, 219, 219, 219, 219, 219, 218, 218], faceCount: 0, bandStart: 0 });
        // Band 1: 8 edges. 6 with 219, 2 with 218. Face = 0.
        bandConfigs.push({ edgeCounts: [219, 219, 219, 219, 219, 219, 218, 218], faceCount: 0, bandStart: 1750 });
        // Band 2: 7 edges. 7 with 250. Face = 0.
        bandConfigs.push({ edgeCounts: [250, 250, 250, 250, 250, 250, 250], faceCount: 0, bandStart: 3500 });
        // Band 3: 7 edges. 7 with 250. Face = 0.
        bandConfigs.push({ edgeCounts: [250, 250, 250, 250, 250, 250, 250], faceCount: 0, bandStart: 5250 });
      } else if (edgePercent === 95) {
        // Band 0: 8 edges (6 with 208, 2 with 207 -> 1662). Face = 88.
        bandConfigs.push({ edgeCounts: [208, 208, 208, 208, 208, 208, 207, 207], faceCount: 88, bandStart: 0 });
        // Band 1: 8 edges (6 with 208, 2 with 207 -> 1662). Face = 88.
        bandConfigs.push({ edgeCounts: [208, 208, 208, 208, 208, 208, 207, 207], faceCount: 88, bandStart: 1750 });
        // Band 2: 7 edges (2 with 238, 5 with 237 -> 1663). Face = 87.
        bandConfigs.push({ edgeCounts: [238, 238, 237, 237, 237, 237, 237], faceCount: 87, bandStart: 3500 });
        // Band 3: 7 edges (2 with 238, 5 with 237 -> 1663). Face = 87.
        bandConfigs.push({ edgeCounts: [238, 238, 237, 237, 237, 237, 237], faceCount: 87, bandStart: 5250 });
      } else {
        // Default 75%
        // Band 0: 8 edges * 175 = 1400. Face = 350.
        bandConfigs.push({ edgeCounts: [175, 175, 175, 175, 175, 175, 175, 175], faceCount: 350, bandStart: 0 });
        // Band 1: 8 edges * 175 = 1400. Face = 350.
        bandConfigs.push({ edgeCounts: [175, 175, 175, 175, 175, 175, 175, 175], faceCount: 350, bandStart: 1750 });
        // Band 2: 7 edges * 175 = 1225. Face = 525.
        bandConfigs.push({ edgeCounts: [175, 175, 175, 175, 175, 175, 175], faceCount: 525, bandStart: 3500 });
        // Band 3: 7 edges * 175 = 1225. Face = 525.
        bandConfigs.push({ edgeCounts: [175, 175, 175, 175, 175, 175, 175], faceCount: 525, bandStart: 5250 });
      }

      let edgeIdx = 0;
      let faceIdx = 0;

      for (let c = 0; c < 4; c++) {
        const config = bandConfigs[c];

        // 1. Populate Edge Particles
        let offset = config.bandStart;
        for (let e = 0; e < config.edgeCounts.length; e++) {
          const edge = edges[edgeIdx++];
          const v1 = vertices[edge[0]];
          const v2 = vertices[edge[1]];
          const count = config.edgeCounts[e];
          for (let i = 0; i < count; i++) {
            const t = Math.random();
            points[offset + i] = {
              x: (v1.x + t * (v2.x - v1.x) + randomRange(-noise, noise)) * scale,
              y: (v1.y + t * (v2.y - v1.y) + randomRange(-noise, noise)) * scale,
              z: (v1.z + t * (v2.z - v1.z) + randomRange(-noise, noise)) * scale,
            };
          }
          offset += count;
        }

        // 2. Populate Face Particles
        if (config.faceCount > 0) {
          let subFaceCount = 0;
          let subFaceParticleCounts: number[] = [];
          if (faces.length === 20) {
            if (c < 2) {
              subFaceCount = 4;
              subFaceParticleCounts = config.faceCount === 88 ? [22, 22, 22, 22] : [88, 88, 87, 87];
            } else {
              subFaceCount = 6;
              subFaceParticleCounts = config.faceCount === 87 ? [15, 15, 15, 14, 14, 14] : [88, 88, 88, 87, 87, 87];
            }
          } else if (faces.length === 12) {
            subFaceCount = 3;
            if (config.faceCount === 88) subFaceParticleCounts = [30, 29, 29];
            else if (config.faceCount === 87) subFaceParticleCounts = [29, 29, 29];
            else if (config.faceCount === 350) subFaceParticleCounts = [117, 117, 116];
            else if (config.faceCount === 525) subFaceParticleCounts = [175, 175, 175];
          }

          for (let f = 0; f < subFaceCount; f++) {
            const face = faces[faceIdx++];
            const count = subFaceParticleCounts[f];
            for (let i = 0; i < count; i++) {
              const pt = sampleFace(vertices, face, isStar);
              points[offset + i] = {
                x: (pt.x + randomRange(-noise, noise)) * scale,
                y: (pt.y + randomRange(-noise, noise)) * scale,
                z: (pt.z + randomRange(-noise, noise)) * scale,
              };
            }
            offset += count;
          }
        }
      }

      return points;
    }

    // 13. Programmatic Geodesic Icosahedron Generator
    const phi_ico = (1 + Math.sqrt(5)) / 2;
    const icoScale = 0.65;
    const icoLen = Math.sqrt(1 + phi_ico * phi_ico);
    const icoVerts = [
      { x: 0,                   y:  1 / icoLen,           z:  phi_ico / icoLen }, // 0
      { x: 0,                   y: -1 / icoLen,           z:  phi_ico / icoLen }, // 1
      { x: 0,                   y:  1 / icoLen,           z: -phi_ico / icoLen }, // 2
      { x: 0,                   y: -1 / icoLen,           z: -phi_ico / icoLen }, // 3
      { x:  1 / icoLen,         y:  phi_ico / icoLen,     z: 0                 }, // 4
      { x: -1 / icoLen,         y:  phi_ico / icoLen,     z: 0                 }, // 5
      { x:  1 / icoLen,         y: -phi_ico / icoLen,     z: 0                 }, // 6
      { x: -1 / icoLen,         y: -phi_ico / icoLen,     z: 0                 }, // 7
      { x:  phi_ico / icoLen,   y: 0,                     z:  1 / icoLen       }, // 8
      { x: -phi_ico / icoLen,   y: 0,                     z:  1 / icoLen       }, // 9
      { x:  phi_ico / icoLen,   y: 0,                     z: -1 / icoLen       }, // 10
      { x: -phi_ico / icoLen,   y: 0,                     z: -1 / icoLen       }, // 11
    ];
    const icoEdges = [
      [0,1],[0,4],[0,5],[0,8],[0,9],
      [1,6],[1,7],[1,8],[1,9],
      [2,3],[2,4],[2,5],[2,10],[2,11],
      [3,6],[3,7],[3,10],[3,11],
      [4,8],[4,10],[5,9],[5,11],
      [6,8],[6,10],
      [7,9],[7,11],[8,10],[9,11],[6,7],[4,5]
    ];
    // Programmatically discover the 20 faces of the icosahedron
    const icoFaces: number[][] = [];
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        for (let k = j + 1; k < 12; k++) {
          const hasIJ = icoEdges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
          const hasJK = icoEdges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
          const hasKI = icoEdges.some(e => (e[0] === k && e[1] === i) || (e[0] === i && e[1] === k));
          if (hasIJ && hasJK && hasKI) {
            icoFaces.push([i, j, k]);
          }
        }
      }
    }
    const sortedIcosahedron = generatePolyhedron(icoVerts, icoEdges, icoFaces, icoScale, false, 0.018, 75);

    // 15. Programmatic Hyperboloid Generator (single-sheet)
    const sortedHyperboloid: { x: number; y: number; z: number }[] = [];
    const hyper_a = 0.28;
    const hyper_b = 0.55;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = randomRange(-1.1, 1.1);
      const v = Math.random() * Math.PI * 2;
      const x = hyper_a * Math.cosh(u) * Math.cos(v);
      const y = hyper_b * Math.sinh(u);
      const z = hyper_a * Math.cosh(u) * Math.sin(v);
      const n = 0.015;
      sortedHyperboloid.push({
        x: x + randomRange(-n, n),
        y: y + randomRange(-n, n),
        z: z + randomRange(-n, n),
      });
    }
    // Shuffle the hyperboloid coordinates for random particle distribution
    for (let i = sortedHyperboloid.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = sortedHyperboloid[i];
      sortedHyperboloid[i] = sortedHyperboloid[j];
      sortedHyperboloid[j] = temp;
    }

    // 17. Programmatic Klein Bottle Generator (3D immersion approximation)
    // Uses the standard parametric immersion: splits into outer tube (u∈[0,π]) and inner tube (u∈[π,2π])
    const sortedKlein: { x: number; y: number; z: number }[] = [];
    const kleinScale = 0.10;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      let x: number, y: number, z: number;
      if (u < Math.PI) {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
        y = 8 * Math.sin(u) + (2 * (1 - Math.cos(u) / 2)) * Math.sin(u) * Math.cos(v);
        z = (2 * (1 - Math.cos(u) / 2)) * Math.sin(v);
      } else {
        x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
        y = 8 * Math.sin(u);
        z = (2 * (1 - Math.cos(u) / 2)) * Math.sin(v);
      }
      const n = 0.04;
      sortedKlein.push({
        x: (x + randomRange(-n, n)) * kleinScale,
        y: (y + randomRange(-n, n)) * kleinScale,
        z: (z + randomRange(-n, n)) * kleinScale,
      });
    }
    sortedKlein.sort((a, b) => a.y - b.y);

    // ─── Kepler-Poinsot Polyhedra (4 Star Polyhedra) ──────────────────────────
    // All derived from the golden ratio φ ≈ 1.618
    const kp_phi = (1 + Math.sqrt(5)) / 2;
    const kp_inv = 1 / kp_phi;                      // = φ−1 ≈ 0.618
    const kp_icoR = Math.sqrt(1 + kp_phi * kp_phi); // circumradius of (0,1,φ)
    const kp_dodR = Math.sqrt(3);                    // circumradius of dodecahedron

    // 12 normalised icosahedral vertices (used by SSD, GD, GI) as {x,y,z}
    const kpIco = [
      { x: 0,               y:  1 / kp_icoR,      z:  kp_phi / kp_icoR },  // 0
      { x: 0,               y:  1 / kp_icoR,      z: -kp_phi / kp_icoR },  // 1
      { x: 0,               y: -1 / kp_icoR,      z:  kp_phi / kp_icoR },  // 2
      { x: 0,               y: -1 / kp_icoR,      z: -kp_phi / kp_icoR },  // 3
      { x:  1 / kp_icoR,    y:  kp_phi / kp_icoR, z: 0                 },  // 4
      { x:  1 / kp_icoR,    y: -kp_phi / kp_icoR, z: 0                 },  // 5
      { x: -1 / kp_icoR,    y:  kp_phi / kp_icoR, z: 0                 },  // 6
      { x: -1 / kp_icoR,    y: -kp_phi / kp_icoR, z: 0                 },  // 7
      { x:  kp_phi / kp_icoR, y: 0,               z:  1 / kp_icoR      },  // 8
      { x:  kp_phi / kp_icoR, y: 0,               z: -1 / kp_icoR      },  // 9
      { x: -kp_phi / kp_icoR, y: 0,               z:  1 / kp_icoR      },  // 10
      { x: -kp_phi / kp_icoR, y: 0,               z: -1 / kp_icoR      },  // 11
    ];

    // 20 normalised dodecahedral vertices (used by GSD) as {x,y,z}
    const kpDod = [
      { x:  1/kp_dodR,  y:  1/kp_dodR,  z:  1/kp_dodR},   // 0  C0
      { x:  1/kp_dodR,  y:  1/kp_dodR,  z: -1/kp_dodR},   // 1  C1
      { x:  1/kp_dodR,  y: -1/kp_dodR,  z:  1/kp_dodR},   // 2  C2
      { x:  1/kp_dodR,  y: -1/kp_dodR,  z: -1/kp_dodR},   // 3  C3
      { x: -1/kp_dodR,  y:  1/kp_dodR,  z:  1/kp_dodR},   // 4  C4
      { x: -1/kp_dodR,  y:  1/kp_dodR,  z: -1/kp_dodR},   // 5  C5
      { x: -1/kp_dodR,  y: -1/kp_dodR,  z:  1/kp_dodR},   // 6  C6
      { x: -1/kp_dodR,  y: -1/kp_dodR,  z: -1/kp_dodR},   // 7  C7
      { x: 0,               y:  kp_inv / kp_dodR,  z:  kp_phi / kp_dodR},   // 8  Z0
      { x: 0,               y:  kp_inv / kp_dodR,  z: -kp_phi / kp_dodR},   // 9  Z1
      { x: 0,               y: -kp_inv / kp_dodR,  z:  kp_phi / kp_dodR},   // 10 Z2
      { x: 0,               y: -kp_inv / kp_dodR,  z: -kp_phi / kp_dodR},   // 11 Z3
      { x:  kp_inv / kp_dodR,  y:  kp_phi / kp_dodR, z: 0             },  // 12 X0
      { x:  kp_inv / kp_dodR,  y: -kp_phi / kp_dodR, z: 0             },  // 13 X1
      { x: -kp_inv / kp_dodR,  y:  kp_phi / kp_dodR, z: 0             },  // 14 X2
      { x: -kp_inv / kp_dodR,  y: -kp_phi / kp_dodR, z: 0             },  // 15 X3
      { x:  kp_phi / kp_dodR,  y: 0,               z:  kp_inv / kp_dodR },  // 16 Y0
      { x:  kp_phi / kp_dodR,  y: 0,               z: -kp_inv / kp_dodR },  // 17 Y1
      { x: -kp_phi / kp_dodR,  y: 0,               z:  kp_inv / kp_dodR },  // 18 Y2
      { x: -kp_phi / kp_dodR,  y: 0,               z: -kp_inv / kp_dodR },  // 19 Y3
    ];

    // SSD and GD share edges
    const ssdEdges: number[][] = [
      [0,1],[0,5],[0,7],[0,9],[0,11],
      [1,5],[1,7],[1,8],[1,10],
      [2,3],[2,4],[2,6],[2,9],[2,11],
      [3,4],[3,6],[3,8],[3,10],
      [4,5],[4,10],[4,11],
      [5,10],[5,11],
      [6,7],[6,8],[6,9],
      [7,8],[7,9],
      [8,10],[9,11],
    ];

    // Find neighbors of each vertex in the icosahedron to form faces for SSD and GD
    const neighborSets: number[][] = [];
    for (let i = 0; i < 12; i++) {
      const neighbors: number[] = [];
      for (let j = 0; j < 12; j++) {
        if (icoEdges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i))) {
          neighbors.push(j);
        }
      }
      neighborSets.push(sortCircular(neighbors, i, icoEdges));
    }

    const ssdFaces = neighborSets;
    const gdFaces = neighborSets;

    // GSD edges
    const gsdEdges: number[][] = [
      [0,8],[0,12],[0,16],  [1,9],[1,12],[1,17],  [2,10],[2,13],
      [2,16],[3,11],[3,13],[3,17],[4,8],[4,14],[4,18],
      [5,9],[5,14],[5,19],[6,10],[6,15],[6,18],[7,11],
      [7,15],[7,19],
      [8,10],[9,11],[12,14],[13,15],[16,17],[18,19],
    ];

    // Find GSD faces (12 coplanar faces of dodecahedron)
    const gsdFaces: number[][] = [];
    for (let i = 0; i < 20; i++) {
      for (let j = i + 1; j < 20; j++) {
        for (let k = j + 1; k < 20; k++) {
          const vi = kpDod[i];
          const vj = kpDod[j];
          const vk = kpDod[k];
          const ux = vj.x - vi.x, uy = vj.y - vi.y, uz = vj.z - vi.z;
          const vx = vk.x - vi.x, vy = vk.y - vi.y, vz = vk.z - vi.z;
          const nx = uy * vz - uz * vy;
          const ny = uz * vx - ux * vz;
          const nz = ux * vy - uy * vx;
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (len < 1e-5) continue;
          const ndx = nx / len, ndy = ny / len, ndz = nz / len;
          const d = ndx * vi.x + ndy * vi.y + ndz * vi.z;
          
          const planeVerts: number[] = [i, j, k];
          for (let m = 0; m < 20; m++) {
            if (m === i || m === j || m === k) continue;
            const vm = kpDod[m];
            const dist = Math.abs(ndx * vm.x + ndy * vm.y + ndz * vm.z - d);
            if (dist < 1e-4) {
              planeVerts.push(m);
            }
          }
          
          if (planeVerts.length === 5) {
            const sortedFace = [...planeVerts].sort((a, b) => a - b);
            if (!gsdFaces.some(f => [...f].sort((a,b)=>a-b).join(',') === sortedFace.join(','))) {
              gsdFaces.push(sortFaceCircular(planeVerts, kpDod));
            }
          }
        }
      }
    }

    // GI faces (20 triangular faces formed by ssdEdges)
    const giFaces: number[][] = [];
    for (let i = 0; i < 12; i++) {
      for (let j = i + 1; j < 12; j++) {
        for (let k = j + 1; k < 12; k++) {
          const hasIJ = ssdEdges.some(e => (e[0] === i && e[1] === j) || (e[0] === j && e[1] === i));
          const hasJK = ssdEdges.some(e => (e[0] === j && e[1] === k) || (e[0] === k && e[1] === j));
          const hasKI = ssdEdges.some(e => (e[0] === k && e[1] === i) || (e[0] === i && e[1] === k));
          if (hasIJ && hasJK && hasKI) {
            giFaces.push([i, j, k]);
          }
        }
      }
    }

    // SSD Option A (Spatial Quadrants, 100% edges, 0% faces)
    const ssdScale = 0.60;
    const ssdEdges_A = [...ssdEdges].sort((e1, e2) => {
      const m1x = (kpIco[e1[0]].x + kpIco[e1[1]].x) / 2;
      const m1y = (kpIco[e1[0]].y + kpIco[e1[1]].y) / 2;
      const m2x = (kpIco[e2[0]].x + kpIco[e2[1]].x) / 2;
      const m2y = (kpIco[e2[0]].y + kpIco[e2[1]].y) / 2;
      return Math.atan2(m1y, m1x) - Math.atan2(m2y, m2x);
    });
    const sortedSSD = generatePolyhedron(kpIco, ssdEdges_A, ssdFaces, ssdScale, true, 0.014, 100);

    // GSD (95% edges, 5% faces)
    const gsdScale = 0.625;
    const sortedGSD = generatePolyhedron(kpDod, gsdEdges, gsdFaces, gsdScale, true, 0.014, 95);

    // GD Option A (Tri-Axial alignment, 100% edges, 0% faces)
    const gdScale = 0.576;
    const gdEdges_A = [...ssdEdges].sort((e1, e2) => {
      const d1x = kpIco[e1[1]].x - kpIco[e1[0]].x, d1y = kpIco[e1[1]].y - kpIco[e1[0]].y, d1z = kpIco[e1[1]].z - kpIco[e1[0]].z;
      const d2x = kpIco[e2[1]].x - kpIco[e2[0]].x, d2y = kpIco[e2[1]].y - kpIco[e2[0]].y, d2z = kpIco[e2[1]].z - kpIco[e2[0]].z;
      const score1 = Math.abs(d1x) + Math.abs(d1y) * 10 + Math.abs(d1z) * 100;
      const score2 = Math.abs(d2x) + Math.abs(d2y) * 10 + Math.abs(d2z) * 100;
      return score1 - score2;
    });
    const sortedGD = generatePolyhedron(kpIco, gdEdges_A, gdFaces, gdScale, false, 0.012, 100);

    // GI (100% edges, 0% faces, outer/inner concentric shell split)
    const giScaleOuter = 0.59;
    const giScaleInner = giScaleOuter * kp_inv;
    const sortedGI: { x: number; y: number; z: number }[] = new Array(7000);
    const giNoise = 0.012;

    const giOuterEdgeCounts = [117,117,117,117,117,117,117,117,117,117,116,116,116,116,116]; // sum = 1750
    let giOffset = 0;
    
    // Outer Shell Color 0 (edges 0 to 14)
    for (let e = 0; e < 15; e++) {
      const edge = ssdEdges[e];
      const v1 = kpIco[edge[0]];
      const v2 = kpIco[edge[1]];
      const count = giOuterEdgeCounts[e];
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        sortedGI[giOffset++] = {
          x: (v1.x + t * (v2.x - v1.x) + randomRange(-giNoise, giNoise)) * giScaleOuter,
          y: (v1.y + t * (v2.y - v1.y) + randomRange(-giNoise, giNoise)) * giScaleOuter,
          z: (v1.z + t * (v2.z - v1.z) + randomRange(-giNoise, giNoise)) * giScaleOuter,
        };
      }
    }
    
    // Outer Shell Color 1 (edges 15 to 29)
    for (let e = 0; e < 15; e++) {
      const edge = ssdEdges[15 + e];
      const v1 = kpIco[edge[0]];
      const v2 = kpIco[edge[1]];
      const count = giOuterEdgeCounts[e];
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        sortedGI[giOffset++] = {
          x: (v1.x + t * (v2.x - v1.x) + randomRange(-giNoise, giNoise)) * giScaleOuter,
          y: (v1.y + t * (v2.y - v1.y) + randomRange(-giNoise, giNoise)) * giScaleOuter,
          z: (v1.z + t * (v2.z - v1.z) + randomRange(-giNoise, giNoise)) * giScaleOuter,
        };
      }
    }

    // Inner Shell Color 2 (edges 0 to 14)
    for (let e = 0; e < 15; e++) {
      const edge = ssdEdges[e];
      const v1 = kpIco[edge[0]];
      const v2 = kpIco[edge[1]];
      const count = giOuterEdgeCounts[e];
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        sortedGI[giOffset++] = {
          x: (v1.x + t * (v2.x - v1.x) + randomRange(-giNoise, giNoise)) * giScaleInner,
          y: (v1.y + t * (v2.y - v1.y) + randomRange(-giNoise, giNoise)) * giScaleInner,
          z: (v1.z + t * (v2.z - v1.z) + randomRange(-giNoise, giNoise)) * giScaleInner,
        };
      }
    }
    
    // Inner Shell Color 3 (edges 15 to 29)
    for (let e = 0; e < 15; e++) {
      const edge = ssdEdges[15 + e];
      const v1 = kpIco[edge[0]];
      const v2 = kpIco[edge[1]];
      const count = giOuterEdgeCounts[e];
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        sortedGI[giOffset++] = {
          x: (v1.x + t * (v2.x - v1.x) + randomRange(-giNoise, giNoise)) * giScaleInner,
          y: (v1.y + t * (v2.y - v1.y) + randomRange(-giNoise, giNoise)) * giScaleInner,
          z: (v1.z + t * (v2.z - v1.z) + randomRange(-giNoise, giNoise)) * giScaleInner,
        };
      }
    }

    // 11. Programmatic 3D Email/Envelope Generator
    const sortedEnvelope: { x: number; y: number; z: number }[] = new Array(PARTICLE_COUNT);
    const envFillIndices: number[] = [];
    const envFillCoordinates: { x: number; y: number; z: number }[] = [];

    // Group 0: Flap Diagonals (\/) - Color 1
    const group0Segments = [
      [{ x: -0.7, y: 0.35, z: 0.05 }, { x: 0.0, y: -0.1, z: 0.05 }],
      [{ x: 0.7, y: 0.35, z: 0.05 }, { x: 0.0, y: -0.1, z: 0.05 }],
      [{ x: -0.7, y: 0.35, z: -0.05 }, { x: 0.0, y: -0.1, z: -0.05 }],
      [{ x: 0.7, y: 0.35, z: -0.05 }, { x: 0.0, y: -0.1, z: -0.05 }],
      [{ x: 0.0, y: -0.1, z: -0.05 }, { x: 0.0, y: -0.1, z: 0.05 }]
    ];

    // Group 1: Side Verticals (| |) - Color 2
    const group1Segments = [
      [{ x: -0.7, y: -0.45, z: 0.05 }, { x: -0.7, y: 0.35, z: 0.05 }],
      [{ x: 0.7, y: -0.45, z: 0.05 }, { x: 0.7, y: 0.35, z: 0.05 }],
      [{ x: -0.7, y: -0.45, z: -0.05 }, { x: -0.7, y: 0.35, z: -0.05 }],
      [{ x: 0.7, y: -0.45, z: -0.05 }, { x: 0.7, y: 0.35, z: -0.05 }]
    ];

    // Group 2: Top Outline - Color 3
    const group2Segments = [
      [{ x: -0.7, y: 0.35, z: 0.05 }, { x: 0.7, y: 0.35, z: 0.05 }],
      [{ x: -0.7, y: 0.35, z: -0.05 }, { x: 0.7, y: 0.35, z: -0.05 }],
      [{ x: -0.7, y: 0.35, z: -0.05 }, { x: -0.7, y: 0.35, z: 0.05 }],
      [{ x: 0.7, y: 0.35, z: -0.05 }, { x: 0.7, y: 0.35, z: 0.05 }]
    ];

    // Group 3: Bottom Outline - Color 4
    const group3Segments = [
      [{ x: -0.7, y: -0.45, z: 0.05 }, { x: 0.7, y: -0.45, z: 0.05 }],
      [{ x: -0.7, y: -0.45, z: -0.05 }, { x: 0.7, y: -0.45, z: -0.05 }],
      [{ x: -0.7, y: -0.45, z: -0.05 }, { x: -0.7, y: -0.45, z: 0.05 }],
      [{ x: 0.7, y: -0.45, z: -0.05 }, { x: 0.7, y: -0.45, z: 0.05 }]
    ];

    const allGroupSegments = [group0Segments, group1Segments, group2Segments, group3Segments];

    const tiltAngle = (25 * Math.PI) / 180; // 25 degrees
    const cosTilt = Math.cos(tiltAngle);
    const sinTilt = Math.sin(tiltAngle);

    for (let c = 0; c < 4; c++) {
      const bandStart = c * 1750;
      const segments = allGroupSegments[c];

      // A: Generate outline particles (1312 particles)
      for (let i = 0; i < 1312; i++) {
        const segIndex = i % segments.length;
        const [p1, p2] = segments[segIndex];
        const t_val = Math.random();
        let x = p1.x + t_val * (p2.x - p1.x);
        let y = p1.y + t_val * (p2.y - p1.y);
        let z = p1.z + t_val * (p2.z - p1.z);

        // Add noise
        const noise = 0.015;
        x += randomRange(-noise, noise);
        y += randomRange(-noise, noise);
        z += randomRange(-noise, noise);

        // Swap x and z, then apply Y rotation tilt of 30 degrees so it starts rotated
        sortedEnvelope[bandStart + i] = {
          x: (z * cosTilt + x * sinTilt) * 0.95,
          y: y * 0.95,
          z: (z * sinTilt - x * cosTilt) * 0.95
        };
      }

      // B: Generate body/scattered particles (438 particles)
      for (let i = 1312; i < 1750; i++) {
        const idx = bandStart + i;
        envFillIndices.push(idx);

        // Sample inside the envelope box volume
        let x = randomRange(-0.7, 0.7);
        let y = randomRange(-0.45, 0.35);
        let z = randomRange(-0.05, 0.05);

        // Add scattering noise
        const noise = 0.04;
        x += randomRange(-noise, noise);
        y += randomRange(-noise, noise);
        z += randomRange(-noise, noise);

        envFillCoordinates.push({
          x: (z * cosTilt + x * sinTilt) * 0.95,
          y: y * 0.95,
          z: (z * sinTilt - x * cosTilt) * 0.95
        });
      }
    }

    // Shuffle the fill coordinates so that fill colors are randomly mixed and scattered
    for (let i = envFillCoordinates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = envFillCoordinates[i];
      envFillCoordinates[i] = envFillCoordinates[j];
      envFillCoordinates[j] = temp;
    }

    // Put shuffled fill coordinates back into their reserved slots in sortedEnvelope
    for (let i = 0; i < envFillIndices.length; i++) {
      sortedEnvelope[envFillIndices[i]] = envFillCoordinates[i];
    }

    // Sort coordinates by Y (bottom-to-top) so colors blend beautifully
    sortedBrain.sort((a, b) => a.y - b.y);
    sortedLightbulb.sort((a, b) => a.y - b.y);
    sortedDNA.sort((a, b) => a.y - b.y);
    sortedTrefoil.sort((a, b) => a.y - b.y);
    sortedAstroid.sort((a, b) => a.y - b.y);

    // ─── Init Particles ───────────────────────────────────────────────────
    const particles: ParticleData[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: randomRange(0, W),
        y: randomRange(0, H),
        vx: 0,
        vy: 0,
        size: randomRange(1.8, 4.2),
        colorIndex: Math.floor(Math.random() * 4),
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        opacity: randomRange(0.2, 0.95),
        springFactor: randomRange(0.015, 0.04),
        damping: randomRange(0.85, 0.92),
        driftOffset: randomRange(0, 1000),
        scaleFactor: 1.0,
      });
    }

    // Sort particles by color group index to align with depth bands
    particles.sort((a, b) => a.colorIndex - b.colorIndex);

    // Sprite Cache (recreated dynamically when settings.colors change)
    const sprites: { [color: string]: HTMLCanvasElement } = {};
    const spriteSize = 32;
    let activeColors = ["", "", "", ""];

    let lastFrameTime = Date.now();
    const localTimes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let animId: number;

    function animate() {
      ctx!.clearRect(0, 0, W, H);
      const now = Date.now();
      const delta = now - lastFrameTime;
      lastFrameTime = now;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

      const isMobile = W < 768;

      // Real-time configurations from ref
      const currentCount = Math.min(particles.length, settingsRef.current.particleCount);
      // Resolve white/black colors depending on theme to prevent them from disappearing
      const theme = settingsRef.current.theme;
      const currentColors = settingsRef.current.colors.map((c) => {
        const lower = c.trim().toLowerCase();
        if (theme === "white") {
          // If light theme, convert complete white to black
          if (lower === "#ffffff" || lower === "#fff" || lower === "rgb(255,255,255)" || lower === "white") {
            return "#000000";
          }
        } else if (theme === "black") {
          // If dark theme, convert complete black to white
          if (lower === "#000000" || lower === "#000" || lower === "rgb(0,0,0)" || lower === "black") {
            return "#ffffff";
          }
        }
        return c;
      }) as [string, string, string, string];
      const stiffnessMultiplier = settingsRef.current.springStiffness / 0.03;
      const dampingMultiplier = settingsRef.current.damping / 0.90;
      const sizeMultiplier = settingsRef.current.particleSize / 3.0;

      // ─── Sprite Cache Sync ────────────────────────────────────────────────
      let colorsChanged = false;
      for (let c = 0; c < 4; c++) {
        if (currentColors[c] !== activeColors[c]) {
          colorsChanged = true;
          break;
        }
      }

      if (colorsChanged) {
        activeColors = [...currentColors];
        currentColors.forEach((color) => {
          const offscreen = sprites[color] || document.createElement("canvas");
          offscreen.width = spriteSize;
          offscreen.height = spriteSize;
          const octx = offscreen.getContext("2d");
          if (octx) {
            octx.clearRect(0, 0, spriteSize, spriteSize);
            const r = spriteSize / 2;
            const grad = octx.createRadialGradient(
              r - r * 0.3,
              r - r * 0.3,
              r * 0.1,
              r,
              r,
              r
            );
            grad.addColorStop(0, "#ffffff");
            grad.addColorStop(0.15, color);
            grad.addColorStop(0.95, color);
            grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");

            octx.fillStyle = grad;
            octx.beginPath();
            octx.arc(r, r, r, 0, Math.PI * 2);
            octx.fill();
          }
          sprites[color] = offscreen;
        });
      }

      const configs = [
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 400 : 550 }, // 0:  Brain (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 320 : 445 }, // 1:  Lightbulb (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 300 : 420 }, // 2:  DNA Helix (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 372 : 528 }, // 3:  SSD / Nebula Spindle Star (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 300 : 420 }, // 4:  Octahedron (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 220 : 330 }, // 5:  Cube (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 360 : 528 }, // 6:  GD / Intersecting Aegis (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 240 : 360 }, // 7:  Torus (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 300 : 420 }, // 8:  Trefoil Knot (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 360 : 525 }, // 9:  GSD / Nova Spire Lattice (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 300 : 420 }, // 10: Astroid Star (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 320 : 445 }, // 11: Envelope (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 363 : 522 }, // 12: GI / Quantum Dual Shell (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 340 : 490 }, // 13: Icosahedron (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.72, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 280 : 400 }, // 14: Hyperboloid (Right, layout-left)
        { cx: isMobile ? W * 0.5 : W * 0.28, cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 260 : 380 }, // 15: Klein Bottle (Left, layout-right)
        { cx: isMobile ? W * 0.5 : W * 0.5,  cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 380 : 520 }, // 16: Sphere (Center)
        { cx: isMobile ? W * 0.5 : W * 0.5,  cy: isMobile ? H * 0.35 : H * 0.5, scale: isMobile ? 320 : 445 }, // 17: Scattered (Center)
      ];

      // ─── Math for Multisection Morphing ──────────────────────────────────
      const shapesList = [
        sortedBrain,
        sortedLightbulb,
        sortedDNA,
        sortedSSD,
        sortedPyramid,
        sortedCube,
        sortedGD,
        sortedTorus,
        sortedTrefoil,
        sortedGSD,
        sortedAstroid,
        sortedEnvelope,
        sortedGI,
        sortedIcosahedron,
        sortedHyperboloid,
        sortedKlein,
        sortedSphere,
        sortedScattered
      ];
      const K = shapesList.length; // 18
      const N = K - 1; // 17

      const scaledRatio = scrollRatio * N;
      let index = Math.floor(scaledRatio);
      let t = scaledRatio - index;

      if (index >= N) {
        index = N - 1;
        t = 1.0;
      } else if (index < 0) {
        index = 0;
        t = 0.0;
      }

      // Scroll Snap Dead Zone curve
      if (settingsRef.current.deadZoneEnabled) {
        const p = settingsRef.current.deadZonePercentage / 100;
        const halfP = p / 2;
        if (t < halfP) {
          t = 0;
        } else if (t > 1 - halfP) {
          t = 1;
        } else {
          t = (t - halfP) / (1 - p);
        }
      }

      // Interpolate center and scale between the two active shapes
      const conf1 = configs[index];
      const conf2 = configs[index + 1] || conf1;

      const cx = lerp(conf1.cx, conf2.cx, t);
      const cy = lerp(conf1.cy, conf2.cy, t);
      const baseScale = lerp(conf1.scale, conf2.scale, t);

      // Track mouse velocity
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
      if (hasGyro && settingsRef.current.gyroEnabled) {
        targetInfluenceX = gyroX;
        targetInfluenceY = gyroY;
      } else if (mouse.active) {
        targetInfluenceX = ((mouse.x - W / 2) / (W / 2)) * 0.12;
        targetInfluenceY = ((mouse.y - H / 2) / (H / 2)) * 0.09;
      }
      mouseInfluenceX += (targetInfluenceX - mouseInfluenceX) * 0.05;
      mouseInfluenceY += (targetInfluenceY - mouseInfluenceY) * 0.05;

      // Offsets for [rotateX, rotateY, rotateZ] for each of the 18 shapes:
      const shapeOffsets = [
        { rx: 0,      ry: 0,       rz: 0 }, // 0:  Brain
        { rx: 0,      ry: -0.5236, rz: 0 }, // 1:  Lightbulb
        { rx: 0,      ry: 0,       rz: 0 }, // 2:  DNA
        { rx: 0,      ry: 0.5236,  rz: 0 }, // 3:  SSD / Nebula Spindle Star
        { rx: 0,      ry: 0,       rz: 0 }, // 4:  Octahedron
        { rx: 0.2618, ry: 0.5236,  rz: 0 }, // 5:  Cube
        { rx: 0,      ry: 0.7854,  rz: 0 }, // 6:  GD / Intersecting Aegis
        { rx: 0,      ry: 0.4363,  rz: 0 }, // 7:  Torus
        { rx: 0,      ry: 1.7453,  rz: 0 }, // 8:  Trefoil Knot
        { rx: 0,      ry: 0.3927,  rz: 0 }, // 9:  GSD / Nova Spire Lattice
        { rx: 0,      ry: 0,       rz: 0 }, // 10: Astroid Star
        { rx: 0,      ry: 0,       rz: 0 }, // 11: Envelope
        { rx: 0,      ry: 0.5236,  rz: 0 }, // 12: GI / Quantum Dual Shell
        { rx: 0,      ry: 0.5236,  rz: 0 }, // 13: Icosahedron
        { rx: 0,      ry: 0.7854,  rz: 0 }, // 14: Hyperboloid
        { rx: 0.3491, ry: 1.5708,  rz: 0 }, // 15: Klein Bottle
        { rx: 0,      ry: 0,       rz: 0 }, // 16: Sphere
        { rx: 0,      ry: 0,       rz: 0 }, // 17: Scattered
      ];

      // Update local timers for all shapes based on active/inactive states
      for (let i = 0; i < 18; i++) {
        const active = (i === index && t < 1) || (i === index + 1 && t > 0);
        if (active) {
          localTimes[i] += delta;
        } else {
          localTimes[i] = 0;
        }
      }

      const off1 = shapeOffsets[index];
      const off2 = shapeOffsets[index + 1] || off1;

      const t1 = localTimes[index] * 0.00015 * settingsRef.current.autoRotateSpeed;
      const ry1 = 1.60 + off1.ry + t1 * 0.12 + mouseInfluenceX;
      const rx1 = 0.25 + off1.rx + Math.sin(t1 * 0.15) * 0.05 + mouseInfluenceY;
      const rz1 = off1.rz + Math.cos(t1 * 0.12) * 0.03;

      const t2 = localTimes[index + 1] * 0.00015 * settingsRef.current.autoRotateSpeed;
      const ry2 = 1.60 + off2.ry + t2 * 0.12 + mouseInfluenceX;
      const rx2 = 0.25 + off2.rx + Math.sin(t2 * 0.15) * 0.05 + mouseInfluenceY;
      const rz2 = off2.rz + Math.cos(t2 * 0.12) * 0.03;

      const rotateY = lerp(ry1, ry2, t);
      const rotateX = lerp(rx1, rx2, t);
      const rotateZ = lerp(rz1, rz2, t);

      // ─── Update Loop ──────────────────────────────────────────────────────
      for (let i = 0; i < currentCount; i++) {
        const p = particles[i];

        const pt1 = shapesList[index][i] || { x: 0, y: 0, z: 0 };
        const pt2 = shapesList[index + 1]?.[i] || pt1;

        let rx = lerp(pt1.x, pt2.x, t);
        let ry = lerp(pt1.y, pt2.y, t);
        let rz = lerp(pt1.z, pt2.z, t);

        // 3D Rotation Matrices
        const cosY = Math.cos(rotateY);
        const sinY = Math.sin(rotateY);
        let x1 = rx * cosY - rz * sinY;
        let z1 = rx * sinY + rz * cosY;

        const cosX = Math.cos(rotateX);
        const sinX = Math.sin(rotateX);
        let y1 = ry * cosX - z1 * sinX;
        let z2 = ry * sinX + z1 * cosX;

        const cosZ = Math.cos(rotateZ);
        const sinZ = Math.sin(rotateZ);
        let x2 = x1 * cosZ - y1 * sinZ;
        let y2 = x1 * sinZ + y1 * cosZ;

        // Perspective Projection
        const fov = 400;
        const perspective = fov / Math.max(50, fov + z2 * 250);
        p.scaleFactor = perspective;

        const scale = baseScale * perspective;
        let targetX = cx + x2 * scale;
        let targetY = cy - y2 * scale;

        // Wave drift in Scattered phase (Index 4 to 5 transition)
        if (index === N - 1) {
          const waveTime = Date.now() * 0.001 + p.driftOffset;
          targetY += Math.sin(waveTime) * 15 * t;
        }

        // Spring Physics
        const ax = (targetX - p.x) * p.springFactor * stiffnessMultiplier;
        const ay = (targetY - p.y) * p.springFactor * stiffnessMultiplier;
        p.vx = (p.vx + ax) * p.damping * dampingMultiplier;
        p.vy = (p.vy + ay) * p.damping * dampingMultiplier;

        p.x += p.vx;
        p.y += p.vy;

        // Proximity-based Mouse Interaction Modes
        if (mouse.active && settingsRef.current.interactionMode !== "disabled") {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = settingsRef.current.interactionRadius;

          if (dist < radius && dist > 0) {
            const factor = (radius - dist) / radius;
            const smoothFactor = factor * factor * (3 - 2 * factor);
            const force = smoothFactor * settingsRef.current.interactionForce;

            const mode = settingsRef.current.interactionMode;
            if (mode === "repel") {
              p.vx += (dx / dist) * force * 0.4;
              p.vy += (dy / dist) * force * 0.4;
            } else if (mode === "attract") {
              p.vx -= (dx / dist) * force * 0.4;
              p.vy -= (dy / dist) * force * 0.4;
            } else if (mode === "swarm") {
              // Orbit velocity + slight gravity pull towards center
              p.vx += (-dy / dist) * force * 0.5 - (dx / dist) * force * 0.08;
              p.vy += (dx / dist) * force * 0.5 - (dy / dist) * force * 0.08;
            } else if (mode === "ripple") {
              // Proximity Breathing wave ripple
              const waveTime = Date.now() * 0.005 + p.driftOffset;
              const waveX = Math.sin(waveTime) * (1.0 + Math.abs(mouseVx) * 0.8) * force * smoothFactor;
              const waveY = Math.cos(waveTime) * (1.0 + Math.abs(mouseVy) * 0.8) * force * smoothFactor;
              p.x += waveX;
              p.y += waveY;
            }
          }
        }
      }

      // ─── Render circular particles (spheres sprites) ──────────────────────
      for (let i = 0; i < currentCount; i++) {
        const p = particles[i];
        if (p.shape !== "circle") continue;

        ctx!.globalAlpha = p.opacity * settingsRef.current.particleOpacity;
        const size = p.size * p.scaleFactor * sizeMultiplier;
        const colorHex = currentColors[p.colorIndex];
        const sprite = sprites[colorHex];
        if (sprite) {
          ctx!.drawImage(
            sprite,
            p.x - size / 2,
            p.y - size / 2,
            size,
            size
          );
        }
      }

      // ─── Render vector particles (triangle, diamond, square) ──────────────
      ctx!.globalAlpha = 0.68 * settingsRef.current.particleOpacity;

      for (let c = 0; c < 4; c++) {
        const colorHex = currentColors[c];

        shapes.forEach((shape) => {
          if (shape === "circle") return;

          ctx!.fillStyle = colorHex;
          ctx!.beginPath();

          for (let i = 0; i < currentCount; i++) {
            const p = particles[i];
            if (p.colorIndex !== c || p.shape !== shape) continue;

            const size = p.size * p.scaleFactor * sizeMultiplier;
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
          }

          ctx!.fill();
        });
      }

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
      if (!settingsRef.current.gyroEnabled) return;
      if (e.gamma !== null && e.beta !== null) {
        hasGyro = true;
        const gammaClamped = Math.max(-30, Math.min(30, e.gamma));
        const betaClamped = Math.max(-30, Math.min(30, e.beta - 60));

        gyroX = (gammaClamped / 30) * 0.30 * settingsRef.current.gyroSensitivity;
        gyroY = (betaClamped / 30) * 0.20 * settingsRef.current.gyroSensitivity;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  return (
    <div className="canvas-container">
      <canvas ref={canvasRef} id="particle-canvas" />
    </div>
  );
}
