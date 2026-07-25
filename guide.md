# 3D Constructs: Interactive Particle Visualizer — Quick Run Guide

An interactive, premium offline library of mathematically generated 3D constructs simulated in real-time using high-performance particle physics. Morph, configure, and interact with 18 stunning shapes seamlessly.

> [!IMPORTANT]
> **Unlike heavy cloud-based 3D applications** that require internet connectivity and load megabytes of asset data, 3D Constructs is **local-first and offline-ready**. It uses optimized HTML5 Canvas 2D render caching to draw thousands of particles on your device CPU, requiring zero dedicated GPU power and functioning entirely offline via a PWA Service Worker.

---

## Table of Contents

- [How to Run](#how-to-run)
  - [Option A: From Source (Development)](#option-a-from-source-development)
  - [Option B: Published Website](#option-b-published-website)
- [Performance Optimization and Asset Caching](#performance-optimization-and-asset-caching)
- [How to Use](#how-to-use)
- [Controls and Interaction Map](#controls-and-interaction-map)
- [Settings Presets Reference](#settings-presets-reference)
- [Directory Index Checklist](#directory-index-checklist)

---

## How to Run

### Option A: From Source (Development)

**Prerequisites:** Node.js (v18.0.0 or higher), npm (v9.0.0 or higher).

1.  **Extract or Clone the codebase**: Ensure you are in the project root directory.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Launch the development server**:
    ```bash
    npm run dev
    ```
4.  **Access the application**: Open your web browser and navigate to `http://localhost:5173/`.

### Option B: Published Website

Access the pre-built, optimized visualizer instantly without any setup or dependencies by visiting:
*   **Production Deployment**: [https://3dconstructs.felixau.in/](https://3dconstructs.felixau.in/)

---

## Performance Optimization and Asset Caching

Since 3D Constructs is a web application, it uses advanced caching and optimization to ensure sub-millisecond updates:

*   **PWA Cache**: The PWA Service Worker (`public/sw.js`) caches the HTML, styles, logo, manifest, and the ~1.4 MB `particles.json` coordinates database on first load. Subsequent visits load instantly from the browser cache, even without internet connection.
*   **Offscreen Canvas Rendering**: To avoid expensive browser canvas redraws, the engine pre-renders particles onto an offscreen canvas and draws them as 2D sprite caches. This technique keeps framerates high even with up to 15,000 active particles.
*   **Asset Preloading**: Critical files (such as styles and main assets) are preloaded using `<link rel="preload">` in `index.html` to eliminate render-blocking delay.

---

## How to Use

1.  **Explore Geometries**: Scroll vertically up and down. The 3D shapes will morph into each other dynamically as you scroll.
2.  **Quick Jump**: Click the dot indicators on the right edge of the screen to jump directly to any shape, or expand the collapsible left sidebar by clicking the logo/menu button and selecting a shape from the list.
3.  **Interact**: Move your cursor over the canvas to interact with the particles. (On mobile, tilt your phone to use the gyroscope tilt drift).
4.  **Tweak Physics**: Click the settings gear icon in the bottom-left corner to open the Settings Panel. Adjust the particle count, size, damping, or spring stiffness to see changes in real-time.
5.  **Toggle Theme**: Toggle the theme to White in the settings. The canvas background turns white, particles become red, and the typography and sidebar adjust for light-mode readability.

---

## Controls and Interaction Map

### Sidebar Navigation Controls

| Trigger | Action | Result |
|---|---|---|
| **Hover Sidebar Menu** | Mouse hover on collapsed sidebar | Expands the sidebar width slightly for visibility. |
| **Click Logo Button** | Left-click `3d Constructs` or the hamburger menu | Toggles sidebar expanded state. |
| **Click Close Button** | Left-click the `╳` icon | Collapses the sidebar. |
| **Select Shape** | Left-click any shape name in the list | Morph-scrolls directly to that page index. |
| **Scroll Shape List** | Scroll inside the middle section | Scrolls the 18-shape list internally on small screens. |

### Mouse Interaction Modes

| Mode | Input Trigger | Description |
|---|---|---|
| **Ripple** | Move cursor on canvas | Sends circular ripple waves outwards, pushing particles away from the cursor. |
| **Repel** | Move cursor on canvas | Directly pushes particles away from the cursor radius. |
| **Attract** | Move cursor on canvas | Pulls particles towards the cursor position. |
| **Swarm** | Move cursor on canvas | Particles follow the cursor like a swarm. |
| **Disabled** | Move cursor on canvas | No interaction occurs. Particles stay fixed to their targets. |

---

## Settings Presets Reference

The settings panel includes four pre-configured presets designed to demonstrate different physical behaviors:

| Preset Name | Interaction Mode | Spring Stiffness | Damping | Description |
|---|---|---|---|---|
| **Neural** | Ripple | `0.01` | `0.90` | Default smooth behavior. Particles react as waves and snap back quickly. |
| **Chaotic** | Repel | `0.015` | `0.96` | High friction and strong push force. Creates dynamic particle trails. |
| **Magnetic** | Attract | `0.04` | `0.85` | Snap-fast attraction to the cursor, resembling a magnetic field. |
| **Swarm** | Swarm | `0.035` | `0.88` | Fluid, organic swarm movements following the cursor path. |

---

## Directory Index Checklist

This index maps the core files of the application to their functional roles:

| Code File | Category | Purpose |
|---|---|---|
| [**`src/App.tsx`**](src/App.tsx) | Core App | Tracks vertical scrolling, handles layout sections, controls overlay states, and mounts sub-components. |
| [**`src/components/ParticleCanvas.tsx`**](src/components/ParticleCanvas.tsx) | Engine | The core physics engine. Handles coordinate loading, Verlet integration, shape morphing (lerp), and mobile gyroscope input. |
| [**`src/components/Navbar.tsx`**](src/components/Navbar.tsx) | UI | The collapsible sidebar navigation menu. Custom close triggers (`╳`), active section highlights, and external link configurations. |
| [**`src/components/SettingsPanel.tsx`**](src/components/SettingsPanel.tsx) | UI | The settings configuration panel. Provides sliders, selectors, theme toggles, and preset buttons. |
| [**`src/data/particles.json`**](src/data/particles.json) | Data | Database of pre-compiled coordinate positions for all 18 structures. |
| [**`src/types.ts`**](src/types.ts) | Types | TypeScript definitions and default settings. |
| [**`src/index.css`**](src/index.css) | Styling | Styling system. Configures dark/light themes, typography (`Outfit` font), layout spacing, and mobile responsive rules. |
| [**`public/sw.js`**](public/sw.js) | PWA | Service Worker script handling offline shell and asset caching. |
