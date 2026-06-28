import ParticleCanvas from "./components/ParticleCanvas";

export default function App() {
  return (
    <div style={{ minHeight: "400vh" }}>
      {/* Standalone background canvas */}
      <ParticleCanvas />
      
      {/* Scroll indicator overlay */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        color: "rgba(255, 255, 255, 0.4)",
        fontFamily: "sans-serif",
        fontSize: "12px",
        pointerEvents: "none",
        zIndex: 10
      }}>
        Scroll to Morph: Brain → Lightbulb → Sphere → Scattered
      </div>
    </div>
  );
}
