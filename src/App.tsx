import { useState, useEffect } from "react";
import ParticleCanvas from "./components/ParticleCanvas";
import SettingsPanel from "./components/SettingsPanel";
import { type AppSettings, DEFAULT_SETTINGS } from "./types";

const shapesMetadata = [
  "Synaptic Brain",
  "Innovating Lightbulb",
  "DNA Double Helix",
  "Structured Octahedron",
  "Geometric Cube",
  "Flowing Torus",
  "Torus Trefoil Knot",
  "Astroid Star",
  "Email Envelope",
  "Holistic Sphere",
  "Cosmic Scattered",
];

const shapeDescriptions = [
  "A neural network simulation representing cognitive synapse firing and complex cerebral connections.",
  "A glowing outline of human invention, mapping creative energy into structured particles.",
  "The genetic blueprint of life, represented as dual-entwined spirals in continuous rotation.",
  "An eight-faced regular solid mapping symmetrical spatial geometry in three dimensions.",
  "A foundational three-dimensional shape demonstrating rigid linear perspective and vertex structures.",
  "A smooth ring-shaped mathematical surface showcasing continuous particle flow along its contours.",
  "An intricate mathematical knot representing advanced topological looping in 3D space.",
  "A sharp, four-cusped hypocycloid curve forming a star-shaped generative particle grid.",
  "A digital communication icon modeled as a planar net projected into three-dimensional coordinates.",
  "A perfect three-dimensional sphere rendered as alternating latitude and longitude orbital outlines.",
  "A chaotic dispersion of stellar dust transitioning into a beautiful entropy-driven cloud."
];

const layoutClasses = [
  "layout-left",   // 0: Brain
  "layout-right",  // 1: Lightbulb
  "layout-left",   // 2: DNA
  "layout-right",  // 3: Octahedron
  "layout-left",   // 4: Cube
  "layout-right",  // 5: Torus
  "layout-left",   // 6: Trefoil Knot
  "layout-right",  // 7: Astroid
  "layout-right",  // 8: Envelope
  "layout-center", // 9: Sphere
  "layout-center"  // 10: Scattered
];

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Sync settings (theme and scroll snapping) to HTML root classes & theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-white", settings.theme === "white");
    root.classList.toggle("scroll-snap", settings.scrollSnapEnabled);

    // Update meta theme-color tag dynamically based on the active theme
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", settings.theme === "white" ? "#ffffff" : "#0d9488");
    }
  }, [settings.theme, settings.scrollSnapEnabled]);

  // Track scroll position to update active dot indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      
      const N = 10; // shapes count - 1 (11 shapes total)
      const index = Math.min(Math.round(ratio * N), N);
      setActiveSection(index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially to capture load state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle URL hash on initial load
  useEffect(() => {
    const handleInitialHash = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      
      const index = shapesMetadata.findIndex(
        (name) => name.toLowerCase().replace(/ /g, "-") === hash
      );
      
      if (index !== -1) {
        setTimeout(() => {
          scrollToSection(index);
        }, 100);
      }
    };

    handleInitialHash();
  }, []);

  // Dynamically update document title, meta description, and URL hash as user scrolls
  useEffect(() => {
    const activeShape = shapesMetadata[activeSection];
    const activeDesc = shapeDescriptions[activeSection] || "";
    const hash = activeShape.toLowerCase().replace(/ /g, "-");

    // Dynamic Title
    document.title = `${activeShape} - 3D Constructs`;

    // Dynamic Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", activeDesc);
    }

    // Bidirectional Hash Sync
    if (window.location.hash !== `#${hash}`) {
      const url = new URL(window.location.href);
      url.hash = hash;
      window.history.replaceState(null, "", url.toString());
    }
  }, [activeSection]);

  const scrollToSection = (index: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (index / 10) * scrollHeight;
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ minHeight: "1100vh", position: "relative" }}>
      {/* Background Interactive Canvas */}
      <ParticleCanvas settings={settings} />

      {/* Scroll Indicators Sidebar */}
      <div className="scroll-indicator-bar">
        {shapesMetadata.map((shapeName, index) => (
          <div
            key={index}
            className={`scroll-dot ${activeSection === index ? "active" : ""}`}
            onClick={() => scrollToSection(index)}
            title={`Scroll to ${shapeName}`}
          />
        ))}
      </div>

      {/* Floating Settings Gear Toggle */}
      <button className="settings-toggle-btn" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{ width: "24px", height: "24px" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        </svg>
      </button>

      {/* Floating Settings panel overlay */}
      <SettingsPanel
        settings={settings}
        onChange={setSettings}
        isOpen={isSettingsOpen}
        onToggle={() => setIsSettingsOpen(false)}
      />

      {/* Semantic Sections containing Headings and Descriptions */}
      {shapesMetadata.map((shapeName, index) => (
        <section
          key={index}
          id={shapeName.toLowerCase().replace(/ /g, "-")}
          className={`section ${layoutClasses[index]}`}
          style={{ pointerEvents: "none" }}
        >
          <div 
            className={`section-content ${activeSection === index ? "active" : ""}`}
            style={{ pointerEvents: "auto" }}
          >
            <h1>{shapeName}</h1>
            <p>{shapeDescriptions[index]}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
