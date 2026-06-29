export interface AppSettings {
  theme: "black" | "white";
  particleCount: number;
  particleSize: number;
  particleOpacity: number;
  colors: [string, string, string, string];
  interactionMode: "ripple" | "repel" | "attract" | "swarm" | "disabled";
  interactionForce: number;
  interactionRadius: number;
  springStiffness: number;
  damping: number;
  gyroEnabled: boolean;
  gyroSensitivity: number;
  autoRotateSpeed: number;
  scrollSnapEnabled: boolean;
  deadZoneEnabled: boolean;
  deadZonePercentage: number; // 0 to 100
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "black",
  particleCount: 7000,
  particleSize: 3.0,
  particleOpacity: 0.75,
  colors: ["#ffb829", "#00ff00", "#0ffff0", "#ffffff"], // Yellow, Green, Cyan, White
  interactionMode: "ripple",
  interactionForce: 2.0,
  interactionRadius: 100,
  springStiffness: 0.01,
  damping: 0.90,
  gyroEnabled: true,
  gyroSensitivity: 1.0,
  autoRotateSpeed: 1.0,
  scrollSnapEnabled: true,
  deadZoneEnabled: true,
  deadZonePercentage: 25,
};

export const PRESETS: Record<string, Partial<AppSettings>> = {
  neural: {
    interactionMode: "ripple",
    springStiffness: 0.01,
    damping: 0.90,
    interactionForce: 2.0,
    autoRotateSpeed: 1.0,
  },
  chaotic: {
    interactionMode: "repel",
    springStiffness: 0.015,
    damping: 0.96,
    interactionForce: 4.5,
    autoRotateSpeed: 2.5,
  },
  magnetic: {
    interactionMode: "attract",
    springStiffness: 0.04,
    damping: 0.85,
    interactionForce: 3.5,
    autoRotateSpeed: 0.5,
  },
  swarm: {
    interactionMode: "swarm",
    springStiffness: 0.035,
    damping: 0.88,
    interactionForce: 2.5,
    autoRotateSpeed: 1.5,
  },
};
