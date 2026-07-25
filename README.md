<p align="center">
  <img src="public/logo.png" width="150" alt="3D Constructs Logo"/>
</p>
<h1 align="center">3D Constructs</h1>
<p align="center">
  <strong>Interactive 3D Mathematical Geometry and Particle Physics Visualizer</strong><br/>
  <em>Navigate through a collapsible sidebar → explore 18 stunning mathematical shapes → morph, configure, and interact in real-time — all offline</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-Web_/_All_Modern_Browsers-0078D6?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/framework-React_19-blue?style=flat-square&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/bundler-Vite_8-FFB900?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/language-TypeScript_6-blue?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/style-Vanilla_CSS_/_Glassmorphism-E34F26?style=flat-square&logo=css3&logoColor=white" alt="CSS" />
  <img src="https://img.shields.io/badge/offline-PWA_Service_Worker-0d9488?style=flat-square" alt="PWA" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License" />
</p>

---

## Table of Contents

- [Overview](#overview)
- [Why 3D Constructs](#why-3d-constructs)
- [Features](#features)
- [Architecture](#architecture)
- [Pipeline Flow and How It Works](#pipeline-flow-and-how-it-works)
- [Application Walkthrough](#application-walkthrough)
- [Visual UI Guide](#visual-ui-guide)
  - [Left Collapsible Sidebar](#left-collapsible-sidebar)
  - [Interactive Settings Control Panel](#interactive-settings-control-panel)
  - [Right Scroll Indicators](#right-scroll-indicators)
- [Access and Launch Instructions](#access-and-launch-instructions)
  - [Running from Source](#running-from-source)
  - [Production Compilation](#production-compilation)
  - [Web Access](#web-access)
- [Project Structure and Key Components](#project-structure-and-key-components)
- [Dependencies](#dependencies)
- [Troubleshooting and Failsafes](#troubleshooting-and-failsafes)
- [Author](#author)

---

## Overview

**3D Constructs** is an interactive, local-first web application showcasing 18 complex mathematical geometries and biological shapes. It renders thousands of animated particles simulated in real-time on a high-performance interactive canvas. The app operates fully client-side, using React 19, TypeScript 6, and Vite 8, with offline support through a custom PWA Service Worker.

Users can seamlessly scroll to morph between shapes (such as the Synaptic Brain, DNA Double Helix, Torus Trefoil Knot, and Klein Bottle), adjust physics parameters (spring stiffness, damping, particle size/opacity, and rotation), toggle interaction modes (ripple, repel, attract, swarm, and disabled), and utilize mobile gyroscope sensor input forces.

---

## Why 3D Constructs

> **Most 3D web visualizations rely on heavy WebGL libraries like Three.js which require significant GPU overhead. 3D Constructs delivers fluid 3D simulations utilizing optimized HTML5 Canvas 2D math, ensuring compatibility and sub-millisecond physics updates on low-power devices.**

| Feature | Heavy WebGL Engines (Three.js/Babylon) | 3D Constructs |
|---|---|---|
| **Bundle Size** | Megabytes of JavaScript parsing overhead | Less than 20 KB of gzipped runtime code |
| **GPU Requirements** | Dedicated GPU or high-power mobile GPU required | Runs smoothly on low-end mobile devices and integrated CPUs |
| **Physics Control** | Hardcoded physics properties | Real-time spring solvers, damping, and multi-mode custom attraction forces |
| **Animation Morphing** | Linear mesh morphing with mesh-splitting artifacts | High-fidelity linear particle interpolation (lerp) across coordinate maps |
| **Offline Capability** | Complex asset loading, offline failures | PWA Service Worker caching for seamless offline runs |
| **Device Integration** | Standard mouse/touch controls | Integrated mobile gyroscope controls for physics-based particle drifting |

---

## Features

### 📐 18 Mathematical Shapes
*   **Geometric Structures**: Structured Octahedron, Geometric Cube, Torus Trefoil Knot, Geodesic Icosahedron, Hyperboloid, and Holistic Sphere.
*   **Organic & Biological Shapes**: Synaptic Brain, Innovating Lightbulb, and DNA Double Helix.
*   **Abstract Mathematical Constructs**: Nebula Spindle Star, Intersecting Aegis, Flowing Torus, Nova Spire Lattice, Astroid Star, Email Envelope, Quantum Dual Shell, Klein Bottle, and Cosmic Scattered.
*   **Theme Adjustments**: Redesigned light/dark templates with white particles turning into premium red (`#ef4444`) in light mode and page headers converting to dark-slate to red gradients.

### 🧪 Advanced Particle Physics
*   **Verlet Integration**: Every particle follows spring mechanics pulling it back to its active coordinate slot, with customizable stiffness and damping.
*   **Real-time Morphing**: Vertical viewport scrolls trigger mathematical interpolation (`lerp`) between shapes, creating fluid transitions.
*   **Custom Particle Configs**: User controls for particle count, particle size, and opacity to tailor performance.

### 🖱️ Dynamic Interaction Modes
*   **Ripple**: Emits waves pushing particles away outwards on cursor move.
*   **Repel**: Pushes particles away from the cursor radius.
*   **Attract**: Pulls particles toward the cursor coordinates.
*   **Swarm**: Particles form a swarm following the cursor movement.
*   **Disabled**: Static physics without cursor interactions.
*   **Mobile Gyroscope**: Interactive mobile tilting causes particles to drift in 3D space, responding to device pitch and roll.

### 🎨 Premium Glassmorphic Design System
*   **Collapsible Sidebar**: Compact left navigation bar, auto-collapsing to a hamburger menu, with custom close triggers (`X`), scrollable listing, and active section highlights.
*   **Glassmorphism**: Backdrop filters (`blur(25px)`) and semi-transparent panels creating premium glass interfaces.
*   **Index Indicators**: Snapping dot scrollbars on the right viewport edge for fast index navigation.
*   **Atomic State Synchronization**: Seamless settings modifications without canvas restarts.

---

## Architecture

```mermaid
graph TD
    subgraph UI["UI Overlay Layer (React 19)"]
        NAV["Navbar Sidebar\n18-shape navigations · Close triggers"]
        SET["Settings Panel\nPhysics Sliders · Presets · Theme Toggles"]
        DOTS["Scroll Dots\nSnapping right sidebar"]
    end

    subgraph Data["Data Repository"]
        JSON["particles.json\n18 structures coordinate matrices"]
    end

    subgraph Engine["Canvas Physics Engine"]
        LERP["Lerp interpolator\nMorphing between shapes"]
        VERLET["Verlet spring solver\nSprings + Damping calculations"]
        FORCE["Attraction forces solver\nRipple · Repel · Attract · Swarm"]
        GYRO["Gyroscope Input\nMobile tilt drift offsets"]
        REND["Offscreen Canvas Renderer\nDouble-buffered drawing context"]
    end

    JSON --> LERP
    NAV --> LERP
    DOTS --> LERP
    LERP --> VERLET
    SET --> VERLET
    FORCE --> VERLET
    GYRO --> VERLET
    VERLET --> REND
```

<details>
<summary>ASCII fallback (click to expand)</summary>

```
┌────────────────────────────────────────────────────────────────────────┐
│                        3D Constructs Application                       │
│                                                                        │
│  ┌───────────────────────┐            ┌─────────────────────────────┐  │
│  │   UI Overlay Layer    │            │        Data Repository      │  │
│  │  (React 19 & TypeScript)│            │                             │  │
│  │  ┌─────────┐ ┌────────┐│            │   ┌─────────────────────┐   │  │
│  │  │ Sidebar │ │Settings││            │   │   particles.json    │   │  │
│  │  │ Navbar  │ │ Panel  ││            │   │ (18 shape matrices) │   │  │
│  │  └────┬────┘ └───┬────┘│            │   └──────────┬──────────┘   │  │
│  └───────┼──────────┼─────┘            └──────────────┼──────────────┘  │
│          │          │                                 │                 │
│          ▼          ▼                                 ▼                 │
│  ┌───────┴──────────┴─────────────────────────────────┴─────────────┐  │
│  │                         Canvas Physics Engine                    │  │
│  │                                                                  │  │
│  │    ┌─────────────────────┐            ┌──────────────────────┐   │  │
│  │    │  Shape Morphing     │            │ Verlet Physics Loop  │   │  │
│  │    │  (Linear Lerp)      ├───────────►│ (Springs + Damping)  │   │  │
│  │    └─────────────────────┘            └──────────┬───────────┘   │  │
│  │                                                  ▲               │  │
│  │    ┌─────────────────────┐  ┌────────────────┐   │               │  │
│  │    │ Cursor Forces       │  │ Gyroscope Tilt │───┘               │  │
│  │    │ (Ripple/Repel/Swarm)│  │ (Mobile Drift) │                   │  │
│  │    └─────────────────────┘  └────────────────┘                   │  │
│  │                                                  │               │  │
│  │                                                  ▼               │  │
│  │                                       ┌──────────────────────┐   │  │
│  │                                       │   Canvas 2D Render   │   │  │
│  │                                       │ (requestAnimFrame)   │   │  │
│  │                                       └──────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

</details>

---

## Pipeline Flow and How It Works

### High-Level Path Diagram

```mermaid
flowchart TD
    A["Raw Point Array parsed"] --> B["Lerp coordinates dynamically based on viewport scroll ratio"]
    B --> C["Scale and reposition coordinates according to isMobile screen check"]
    C --> D{"Active Interaction Mode?"}
    D -->|Attract / Repel / Ripple / Swarm| E["Compute cursor distance and apply cursor offset vectors"]
    D -->|Disabled| F["Skip cursor forces"]
    E --> G["Apply drift offsets from Gyroscope pitch & roll if mobile"]
    F --> G
    G --> H["Solve Verlet integration: velocity += spring force - damping"]
    H --> I["Offscreen canvas creates/loads cache sprites for colors"]
    I --> J["Render frame buffer onto main canvas"]
```

<details>
<summary>ASCII fallback (click to expand)</summary>

```
Point Array parsed from JSON database (particles.json)
     │
     ▼
Lerp coordinates dynamically based on viewport scroll ratio (Morphing)
     │
     ▼
Scale and reposition coordinates according to isMobile screen check
     │
     ▼
Check active interaction mode:
   ├─► Attract/Repel/Ripple/Swarm → Calculate cursor distance and apply force offset vector
   └─► Disabled → Skip cursor forces
     │
     ▼
Apply drift offsets from gyroscope pitch and roll (if on mobile)
     │
     ▼
Solve Verlet integration: velocity += (target - current) * stiffness - velocity * damping
     │
     ▼
Offscreen Canvas caches particle sprites (optimized color rendering)
     │
     ▼
Render frame buffer onto main HTML5 Canvas context
```

</details>

### General Processing Overview

1.  **Coordinates Parsing**: On startup, `ParticleCanvas.tsx` reads 18 pre-compiled 3D coordinates arrays from `particles.json`.
2.  **Morphing Interpolation**: The active scroll position tracks the viewport, determining the interpolation weight (`t`) between the current shape and the next shape. The engine uses linear interpolation (`lerp`) to calculate each particle's target destination.
3.  **Screen Scale Adjustments**: The canvas automatically checks screen dimensions. Desktop shapes use left/right off-centers to accommodate sidebar layouts, while mobile shapes are shifted down by 10% (`H * 0.45`) to sit cleanly below mobile headings.
4.  **Physics Integration**: For every frame, the spring solver updates each particle's velocity toward its target coordinates based on the configured spring stiffness and damping coefficients.
5.  **Force Fields**: Cursor coordinates alter particle velocities dynamically. Ripples emit outward waves, repellers push particles away, attractors drag particles toward the mouse, and swarms pull particles behind the cursor.
6.  **Sprite Caching**: To maximize performance, particles are pre-drawn onto a hidden offscreen canvas for each color, caching them as sprites. The main canvas draws these cached sprites, bypassing expensive pixel-rendering operations.

---

## Application Walkthrough

### Starting the Application
When the user accesses the visualizer:
1.  **Service Worker Activation**: `sw.js` initializes in the background, pre-caching critical shell files (`index.html`, `logo.png`, styles) to enable offline execution.
2.  **App Setup**: `App.tsx` loads, initializing settings with defaults or presets.
3.  **Canvas Setup**: `ParticleCanvas` initializes its physics loop, mapping system memory allocations for 7,000 baseline particles.
4.  **Layout Rendering**: Visual components load alongside the canvas, placing the collapsible sidebar on the left and the scroll indicators on the right.

### Customizing & Interacting
-  **Adjust Settings**: Click the settings gear icon bottom-left to slide open the glassmorphic control drawer. Modify values or select preset layouts (neural, chaotic, magnetic, swarm).
-  **Navigation**: Click items in the sidebar or right scroll dots to trigger smooth scroll morphing. Clicking `3d Constructs` or `X` collapses the sidebar back to menu mode.
-  **Light Mode**: Toggle the white theme option in Settings. The background shifts to white, the sidebar turns to a light-grey glass pane, headings colorize with dark-blue/red gradients, and white particles render as vibrant red.

---

## Visual UI Guide

The interface is structured to prioritize high-fidelity visuals, responsiveness, and premium design:

```
┌────────────────────────────────────────────────────────┐
│[3d Constructs ╳]                                       │
│                                                        │
│  3D LIBRARY                                            │
│  • Synaptic Brain                                    • │
│  • Geometric Cube                                    • │
│  • Torus Trefoil                                     • │
│  • Klein Bottle                                      • │
│                                                      • │
│                                                      • │
│                                                      • │
│                                                      • │
│                                                      • │
│                                                        │
│[⚙️ Settings]                                           │
└────────────────────────────────────────────────────────┘
```

### Left Collapsible Sidebar

| UI Element | Description | Interaction |
|---|---|---|
| **Branded Title** | Heading showing "3d Constructs" with custom gradient. | Clicking collapses the sidebar. |
| **Close Button (`╳`)** | Subtle close icon next to the title. | Clicking collapses the sidebar. |
| **3D Library List** | 18-item list of all mathematical constructs. | Clicking scroll-morphs to the chosen index. |
| **Middle Scroll Container** | Flex-grow section with high-contrast teal scrollbar. | Enables internal scrolling on small screens. |
| **Settings Link** | Action button displaying Settings icon. | Toggles settings panel drawer. |
| **GitHub link** | Integrates link to the code repository. | Opens `https://github.com/Felix-au/...` |
| **Profile link** | Direct link button to the author profile. | Opens `https://www.felixau.in/` |

---

### Interactive Settings Control Panel

| Control | Type | Values / Defaults | Purpose |
|---|---|---|---|
| **Presets** | Button Group | Neural, Chaotic, Magnetic, Swarm | Instantly load specialized physics configurations. |
| **Theme** | Toggle | Black (Dark), White (Light) | Change visual color themes. |
| **Particle Count** | Slider | 1,000 - 15,000 (Default: 7,000) | Adjust particle count (performance optimization). |
| **Particle Size** | Slider | 1.0 - 6.0 px (Default: 3.0) | Adjust particle thickness. |
| **Particle Opacity** | Slider | 0.1 - 1.0 (Default: 0.75) | Adjust transparency of the color bands. |
| **Interaction Mode** | Select | Ripple, Repel, Attract, Swarm, Disabled | Choose mouse interaction mechanics. |
| **Interaction Force** | Slider | 0.5 - 5.0 (Default: 2.0) | Modify mouse force strength. |
| **Interaction Radius** | Slider | 50 - 250 px (Default: 100) | Set cursor field radius. |
| **Spring Stiffness** | Slider | 0.005 - 0.1 (Default: 0.01) | Change coordinate spring attraction strength. |
| **Damping** | Slider | 0.80 - 0.99 (Default: 0.90) | Modify friction dampening on particle movement. |
| **Gyroscope Enable** | Toggle | Enabled / Disabled | Enable mobile tilting control. |
| **Auto Rotate Speed** | Slider | 0.0 - 5.0 (Default: 1.0) | Set particle system rotation velocity. |

---

### Right Scroll Indicators

| UI Element | Description | Interaction |
|---|---|---|
| **Indicator Bar** | Vertical dotted scrollbar positioned on the right screen edge. | Tracks section scrolling. |
| **Scroll Dots** | 18 individual dots representing each mathematical construct. | Clicking snaps view to that index. |
| **Active Dot** | Glow-accented dot representing the active viewport section. | Visual reference of current scrolling index. |

---

## Access and Launch Instructions

### Running from Source

**Prerequisites:** Node.js 18+, npm (or yarn / pnpm).

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/Felix-au/3d-Constructs-Library.git
    cd 3d-Constructs-Library
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173/` in your browser.

---

### Production Compilation

To compile and verify code correctness for production deployments:
1.  **Type Check & Lint**:
    ```bash
    npx tsc --noEmit
    npm run lint
    ```
2.  **Build Production Assets**:
    ```bash
    npm run build
    ```
    This outputs optimized, minified production assets into the `dist/` directory.

---

### Web Access

Access the live production build instantly at:
*   **Canonical URL**: [https://3dconstructs.felixau.in/](https://3dconstructs.felixau.in/)

---

## Project Structure and Key Components

```
├── DocumentaionInstruct/ # Standard reference files
├── public/               # Asset assets and PWA manifests
│   ├── sw.js             # Offline Service Worker
│   ├── logo.png          # App icon
│   └── manifest.webmanifest
├── src/
│   ├── components/
│   │   ├── Navbar.tsx          # Collapsible left sidebar
│   │   ├── ParticleCanvas.tsx  # Canvas particle physics engine
│   │   └── SettingsPanel.tsx   # Glassmorphic control drawer
│   ├── data/
│   │   └── particles.json      # Shapes coordinate arrays
│   ├── App.tsx           # App root and section layout
│   ├── index.css         # Style system and themes
│   ├── main.tsx          # App entry point & SW registry
│   └── types.ts          # Settings and presets type definitions
```

### Key Components

| Component / File | Functional Purpose |
|---|---|
| [`App.tsx`](src/App.tsx) | Renders overlays, mounts canvas, tracks vertical viewport scrolling, and synchronizes the active section. |
| [`ParticleCanvas.tsx`](src/components/ParticleCanvas.tsx) | Mathematical engine running the `requestAnimationFrame` render loop, linear morphing, Verlet integrations, and gyroscope/mouse event binding. |
| [`Navbar.tsx`](src/components/Navbar.tsx) | Renders the vertical sidebar menu, close triggers, shape listing, and settings/profile integration buttons. |
| [`SettingsPanel.tsx`](src/components/SettingsPanel.tsx) | Handles presets, theme switching, and particle controls. |
| [`particles.json`](src/data/particles.json) | The compiled database containing coordinate mappings for all 18 structures. |
| [`sw.js`](public/sw.js) | Caches files to enable running the visualizer offline. |

---

## Dependencies

Crucial project dependencies are kept minimal to ensure performance:

| Dependency | Category | Version | Purpose |
|---|---|---|---|
| **React** | Core Library | `^19.2.7` | UI component architecture and state management. |
| **React DOM** | Core Library | `^19.2.7` | DOM rendering. |
| **Vite** | Dev Dependency | `^8.1.0` | High-performance bundler. |
| **TypeScript** | Dev Dependency | `~6.0.2` | Strong type safety. |
| **Oxlint** | Dev Dependency | `^1.69.0` | Ultra-fast JS/TS linter. |

---

## Troubleshooting and Failsafes

### Troubleshooting Guide

| Issue | Root Cause | Resolution |
|---|---|---|
| **Low Framerates (Lag)** | Too many particles active on lower-end CPUs. | Open Settings → Reduce **Particle Count** slider (e.g. to 3,000). |
| **Mobile Gyroscope Fails** | Insecure HTTP connection or missing sensor permission. | Ensure you are on HTTPS (`https://...`). Tilt permissions must be approved. |
| **Missing Scrollbar / Cutoff** | `box-sizing` layout conflicts on sidebar containers. | Handled via local `box-sizing: border-box` resets on the `.site-navbar` tree. |
| **Scroll Snapping Issues** | Scroll snapping is disabled or active. | Snapping can be enabled or disabled in the Settings drawer dynamically. |
| **Light Theme Contrast** | Light theme styles missing or incorrect background variables. | Fixed with styling overrides in `index.css` applying `.theme-white` modifiers. |

### Core Failsafes
*   **Max Particle Cap**: Particle count is restricted to 15,000 to prevent system memory overflows.
*   **Friction Damping Boundaries**: Minimum damping is restricted to `0.80` to prevent infinite particle drift.
*   **Failsafe Physics Spring Limits**: Maximum spring stiffness is capped at `0.1` to prevent visual tearing during shape morphs.

---

## Author

<p align="center">
  <strong>Felix Au</strong><br/>
  <a href="https://github.com/Felix-au">GitHub Profile</a> • <a href="mailto:felix@felixau.in">Email Contact</a> • <a href="https://www.felixau.in/">Portfolio Website</a>
</p>

<p align="center"><sub>Bringing mathematical geometry to life through fluid, interactive particle physics.</sub></p>
