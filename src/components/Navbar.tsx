import { useState } from "react";

interface NavbarProps {
  activeSection: number;
  onNavigate: (index: number) => void;
  onOpenSettings: () => void;
  colors: [string, string, string, string];
}

const shapesMetadata = [
  "Synaptic Brain",
  "Innovating Lightbulb",
  "DNA Double Helix",
  "Nebula Spindle Star",
  "Structured Octahedron",
  "Geometric Cube",
  "Intersecting Aegis",
  "Flowing Torus",
  "Torus Trefoil Knot",
  "Nova Spire Lattice",
  "Astroid Star",
  "Email Envelope",
  "Quantum Dual Shell",
  "Geodesic Icosahedron",
  "Hyperboloid",
  "Klein Bottle",
  "Holistic Sphere",
  "Cosmic Scattered",
];

export default function Navbar({ activeSection, onNavigate, onOpenSettings, colors }: NavbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav className={`site-navbar mode-sidebar ${isExpanded ? "sidebar-expanded" : ""}`}>
      <div className="nav-container">
        {/* Top/Left Section: Logo and Menu Button */}
        <div className="nav-logo-group">
          <button 
            className="nav-logo" 
            onClick={() => setIsExpanded(!isExpanded)} 
            aria-label="Toggle Sidebar"
          >
            {!isExpanded ? (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-menu-svg">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            ) : (
              <span className="nav-logo-text gradient-text">Constructs.dev</span>
            )}
          </button>
          {isExpanded && (
            <button className="nav-close-btn" onClick={() => setIsExpanded(false)} aria-label="Collapse Sidebar">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Center Section: List of Shapes (visible when expanded) */}
        {isExpanded && (
          <div className="sidebar-middle-section">
            <div className="sidebar-divider">3D Library</div>
            <div className="sidebar-cursor-list">
              {shapesMetadata.map((name, index) => (
                <button
                  key={index}
                  className={`sidebar-cursor-item ${activeSection === index ? "active" : ""}`}
                  onClick={() => {
                    onNavigate(index);
                    setIsExpanded(false);
                  }}
                >
                  <span 
                    className="cursor-item-dot" 
                    style={{ backgroundColor: colors[index % 4] }} 
                  />
                  <span className="cursor-item-name">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom/Right Section: Controls */}
        <div className="nav-links">
          {/* Settings Trigger */}
          <button 
            onClick={() => { onOpenSettings(); setIsExpanded(false); }} 
            className="nav-link-btn" 
            aria-label="Settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              style={{ width: "16px", height: "16px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            <span className="nav-link-text">Settings</span>
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/Felix-au/experiment"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
            aria-label="GitHub Repository"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
            </svg>
            <span className="nav-link-text">GitHub</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
