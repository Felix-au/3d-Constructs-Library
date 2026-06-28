import { useState, useEffect } from "react";
import ParticleCanvas from "./components/ParticleCanvas";
import SettingsPanel from "./components/SettingsPanel";
import { type AppSettings, DEFAULT_SETTINGS } from "./types";

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  // Sync settings (theme and scroll snapping) to HTML root classes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("theme-white", settings.theme === "white");
    root.classList.toggle("scroll-snap", settings.scrollSnapEnabled);
  }, [settings.theme, settings.scrollSnapEnabled]);

  // Track scroll position to update active dot indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      
      const N = 5; // shapes count - 1 (6 shapes total)
      const index = Math.min(Math.round(ratio * N), N);
      setActiveSection(index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Run once initially to capture load state
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (index: number) => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetScroll = (index / 5) * scrollHeight;
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  };

  const sectionsData = [
    {
      title: "Infinite Intelligence",
      description: "Unleash the neural power of 7,000 active particles. A responsive 3D brain map that reacts dynamically to your movements, simulating synaptic firing patterns in real time.",
      layout: "left",
    },
    {
      title: "Illuminated Ideas",
      description: "Watch ideas crystallize into light. Seamless morphing mechanics transition the particle swarm into an organic glowing lightbulb structure, representing clarity and innovation.",
      layout: "right",
    },
    {
      title: "Geometric Symmetry",
      description: "Perfect mathematical structure. Particles arrange themselves onto the six faces of a hollow 3D cube, showcasing structural balance, dimensions, and structural logic.",
      layout: "left",
    },
    {
      title: "Continuous Harmony",
      description: "An infinite loop of digital current. The torus represents a perfect closed feedback system. A beautiful donut configuration that flows continuously in 3D space.",
      layout: "right",
    },
    {
      title: "Global Connection",
      description: "A unified, spherical network traversing the globe. Representing holistic systems, global scaling, and infinite connection across a single orbital axis.",
      layout: "center",
    },
    {
      title: "Cosmic Drift",
      description: "Entropy in digital equilibrium. The particles disperse into a gentle, floating space dust field. Hover to ripple the cosmos or toggle settings to bend the laws of physics.",
      layout: "center",
    },
  ];

  return (
    <div style={{ minHeight: "600vh", position: "relative" }}>
      {/* Background Interactive Canvas */}
      <ParticleCanvas settings={settings} />

      {/* Scroll Indicators Sidebar */}
      <div className="scroll-indicator-bar">
        {sectionsData.map((_, index) => (
          <div
            key={index}
            className={`scroll-dot ${activeSection === index ? "active" : ""}`}
            onClick={() => scrollToSection(index)}
            title={`Scroll to Shape ${index + 1}`}
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

      {/* Full-bleed Content Sections */}
      {sectionsData.map((section, index) => (
        <section key={index} className={`section layout-${section.layout}`}>
          <div className="section-content">
            <h1>{section.title}</h1>
            <p>{section.description}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
