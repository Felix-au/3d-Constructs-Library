import { useState } from "react";
import { type AppSettings, DEFAULT_SETTINGS, PRESETS } from "../types";

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (newSettings: AppSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
}

type TabType = "general" | "physics" | "mouse" | "colors";

export default function SettingsPanel({
  settings,
  onChange,
  isOpen,
  onToggle,
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...settings.colors] as [string, string, string, string];
    newColors[index] = newColor;
    updateSetting("colors", newColors);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData("text/plain");
    const sourceIndex = sourceIndexStr ? parseInt(sourceIndexStr, 10) : draggedIndex;
    
    if (sourceIndex !== null && sourceIndex !== targetIndex && sourceIndex !== undefined) {
      const newColors = [...settings.colors] as [string, string, string, string];
      const temp = newColors[sourceIndex];
      newColors[sourceIndex] = newColors[targetIndex];
      newColors[targetIndex] = temp;
      updateSetting("colors", newColors);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const applyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      onChange({
        ...settings,
        ...preset,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-panel">
      {/* Header */}
      <div className="settings-header">
        <h2>Canvas Settings</h2>
      </div>

      {/* Tabs */}
      <div className="settings-tabs">
        {(["general", "physics", "mouse", "colors"] as TabType[]).map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="settings-body no-scrollbar">
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <>
            {/* Presets */}
            <div className="setting-row">
              <label className="setting-label">Preset Mode</label>
              <select
                className="control-select"
                onChange={(e) => applyPreset(e.target.value)}
                style={{ width: "100%" }}
              >
                <option value="neural">Neural Flow (Default)</option>
                <option value="chaotic">Chaotic Drift</option>
                <option value="magnetic">Magnetic Pull</option>
                <option value="swarm">Swarm Orbit</option>
              </select>
              <span className="setting-description">
                Quick-configure physics presets for different canvas behaviors.
              </span>
            </div>

            {/* Theme Toggle */}
            <div className="setting-row setting-row-horizontal">
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="setting-label">Light Theme</span>
                <span className="setting-description">Toggle white/black background.</span>
              </div>
              <button
                className={`switch-btn ${settings.theme === "white" ? "active" : ""}`}
                onClick={() => updateSetting("theme", settings.theme === "white" ? "black" : "white")}
              >
                <div className="switch-knob" />
              </button>
            </div>

            {/* Scroll Snap Toggle */}
            <div className="setting-row setting-row-horizontal">
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="setting-label">Scroll Snapping</span>
                <span className="setting-description">Snap sections to viewport.</span>
              </div>
              <button
                className={`switch-btn ${settings.scrollSnapEnabled ? "active" : ""}`}
                onClick={() => updateSetting("scrollSnapEnabled", !settings.scrollSnapEnabled)}
              >
                <div className="switch-knob" />
              </button>
            </div>

            {/* Scroll Snap Dead Zone Toggle */}
            <div className="setting-row setting-row-horizontal">
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="setting-label">Morph Stability Zone</span>
                <span className="setting-description">Stays fully formed near snap points.</span>
              </div>
              <button
                className={`switch-btn ${settings.deadZoneEnabled ? "active" : ""}`}
                onClick={() => updateSetting("deadZoneEnabled", !settings.deadZoneEnabled)}
              >
                <div className="switch-knob" />
              </button>
            </div>

            {/* Scroll Snap Dead Zone Size */}
            {settings.deadZoneEnabled && (
              <div className="setting-row">
                <div className="setting-label">
                  <span>Stability Range</span>
                  <span className="setting-value">{settings.deadZonePercentage}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  className="control-slider"
                  value={settings.deadZonePercentage}
                  onChange={(e) => updateSetting("deadZonePercentage", parseInt(e.target.value))}
                />
              </div>
            )}


          </>
        )}

        {/* PHYSICS TAB */}
        {activeTab === "physics" && (
          <>
            {/* Particle Size */}
            <div className="setting-row">
              <div className="setting-label">
                <span>Base Particle Size</span>
                <span className="setting-value">{settings.particleSize.toFixed(1)}px</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.1"
                className="control-slider"
                value={settings.particleSize}
                onChange={(e) => updateSetting("particleSize", parseFloat(e.target.value))}
              />
            </div>

            {/* Particle Opacity */}
            <div className="setting-row">
              <div className="setting-label">
                <span>Particle Opacity</span>
                <span className="setting-value">{settings.particleOpacity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.00"
                step="0.05"
                className="control-slider"
                value={settings.particleOpacity}
                onChange={(e) => updateSetting("particleOpacity", parseFloat(e.target.value))}
              />
            </div>

            {/* Spring Stiffness */}
            <div className="setting-row">
              <div className="setting-label">
                <span>Spring Stiffness</span>
                <span className="setting-value">{settings.springStiffness.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.005"
                max="0.08"
                step="0.001"
                className="control-slider"
                value={settings.springStiffness}
                onChange={(e) => updateSetting("springStiffness", parseFloat(e.target.value))}
              />
            </div>

            {/* Damping */}
            <div className="setting-row">
              <div className="setting-label">
                <span>Damping (Decay)</span>
                <span className="setting-value">{settings.damping.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="0.99"
                step="0.01"
                className="control-slider"
                value={settings.damping}
                onChange={(e) => updateSetting("damping", parseFloat(e.target.value))}
              />
            </div>

            {/* Auto Rotate Speed */}
            <div className="setting-row">
              <div className="setting-label">
                <span>Auto-Rotation Speed</span>
                <span className="setting-value">{settings.autoRotateSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="5.0"
                step="0.1"
                className="control-slider"
                value={settings.autoRotateSpeed}
                onChange={(e) => updateSetting("autoRotateSpeed", parseFloat(e.target.value))}
              />
            </div>
          </>
        )}

        {/* MOUSE TAB */}
        {activeTab === "mouse" && (
          <>
            {/* Interaction Mode */}
            <div className="setting-row">
              <label className="setting-label">Cursor Mode</label>
              <select
                className="control-select"
                style={{ width: "100%" }}
                value={settings.interactionMode}
                onChange={(e) => updateSetting("interactionMode", e.target.value as AppSettings["interactionMode"])}
              >
                <option value="ripple">Volumetric Ripple</option>
                <option value="repel">Proximity Repel</option>
                <option value="attract">Gravity Attraction</option>
                <option value="swarm">Swarm Orbit</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            {/* Interaction Force */}
            {settings.interactionMode !== "disabled" && (
              <div className="setting-row">
                <div className="setting-label">
                  <span>Interaction Force</span>
                  <span className="setting-value">{settings.interactionForce.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.1"
                  className="control-slider"
                  value={settings.interactionForce}
                  onChange={(e) => updateSetting("interactionForce", parseFloat(e.target.value))}
                />
              </div>
            )}

            {/* Proximity Radius */}
            {settings.interactionMode !== "disabled" && (
              <div className="setting-row">
                <div className="setting-label">
                  <span>Proximity Radius</span>
                  <span className="setting-value">{settings.interactionRadius}px</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="250"
                  step="5"
                  className="control-slider"
                  value={settings.interactionRadius}
                  onChange={(e) => updateSetting("interactionRadius", parseInt(e.target.value))}
                />
              </div>
            )}

            {/* Gyro Toggle */}
            <div className="setting-row setting-row-horizontal">
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span className="setting-label">Gyroscope Interaction</span>
                <span className="setting-description">Interact via device rotation.</span>
              </div>
              <button
                className={`switch-btn ${settings.gyroEnabled ? "active" : ""}`}
                onClick={() => updateSetting("gyroEnabled", !settings.gyroEnabled)}
              >
                <div className="switch-knob" />
              </button>
            </div>

            {/* Gyro Sensitivity */}
            {settings.gyroEnabled && (
              <div className="setting-row">
                <div className="setting-label">
                  <span>Gyro Sensitivity</span>
                  <span className="setting-value">{settings.gyroSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3.0"
                  step="0.1"
                  className="control-slider"
                  value={settings.gyroSensitivity}
                  onChange={(e) => updateSetting("gyroSensitivity", parseFloat(e.target.value))}
                />
              </div>
            )}
          </>
        )}

        {/* COLORS TAB */}
        {activeTab === "colors" && (
          <>
            <div className="setting-row">
              <label className="setting-label">Particle Palette</label>
              <span className="setting-description" style={{ marginBottom: "8px" }}>
                Click circles to pick colors. They align bottom-to-top in 3D.
              </span>
              <div className="control-color-grid">
                {settings.colors.map((color, index) => (
                  <div
                    key={index}
                    className={`color-picker-wrapper ${
                      draggedIndex === index ? "dragging" : ""
                    } ${dragOverIndex === index ? "drag-over" : ""}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => handleDragLeave(index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div
                      className="color-circle"
                      style={{ backgroundColor: color }}
                    >
                      <input
                        type="color"
                        className="color-input"
                        value={color}
                        onChange={(e) => handleColorChange(index, e.target.value)}
                      />
                    </div>
                    <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: "var(--text-muted)" }}>
                      {color.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="setting-row">
              <button
                className="btn-secondary"
                onClick={() => updateSetting("colors", [...DEFAULT_SETTINGS.colors] as [string, string, string, string])}
              >
                Reset Colors
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <button
          className="btn-secondary"
          onClick={() => onChange(DEFAULT_SETTINGS)}
          style={{ flex: 1 }}
        >
          Reset All
        </button>
        <button
          className="btn-secondary"
          onClick={onToggle}
          style={{ flex: 1, backgroundColor: "var(--accent-color)", color: "#ffffff", borderColor: "var(--accent-color)" }}
        >
          Close
        </button>
      </div>
    </div>
  );
}
