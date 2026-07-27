import { useEffect, useRef, useState } from "react";

// Adjustable Cursor Physics and Style Constants
const PHYSICS = {
  dotEasing: 0.35,      // Easing speed for the inner dot (high = faster tracking)
  ringEasing: 0.085,    // Easing speed for the trailing ring (lower = longer trailing)
  magneticForce: 0.45,   // Strength of magnetic attraction (0 to 1)
  magnetMaxSize: 80,    // Maximum element size (px) to qualify for magnetic snap
};

export default function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  // DOM Refs
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  // Position Tracking Refs
  const mousePos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  
  // Element Magnetic Attraction Refs
  const magneticElement = useRef<Element | null>(null);

  useEffect(() => {
    // 1. Touch device check (mobile/tablet fallback)
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) {
      return;
    }

    // 2. Accessibility: Check for prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Make cursor visible on first mouse movement
    setIsVisible(true);

    // 3. Mouse Event Handlers
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      setIsClicked(true);

      // Trigger satisfying ripple release
      const ripple = rippleRef.current;
      if (ripple) {
        ripple.classList.remove("animate");
        // Force Reflow
        void ripple.offsetWidth;
        ripple.style.left = `${mousePos.current.x}px`;
        ripple.style.top = `${mousePos.current.y}px`;
        ripple.classList.add("animate");
      }
    };

    const handleMouseUp = () => {
      setIsClicked(false);
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    // 4. Interactive Hover & Magnetism Scanner
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      // Find nearest interactive ancestor
      const interactiveEl = target.closest(
        'a, button, select, input[type="range"], .scroll-dot, .color-circle, .color-picker-wrapper, .sidebar-cursor-item, [role="button"]'
      );

      if (interactiveEl) {
        setIsHovered(true);

        // Check if element qualifies for magnetic snap (is reasonably small)
        const rect = interactiveEl.getBoundingClientRect();
        const maxDimension = Math.max(rect.width, rect.height);
        
        if (maxDimension <= PHYSICS.magnetMaxSize) {
          magneticElement.current = interactiveEl;
        } else {
          magneticElement.current = null;
        }
      } else {
        setIsHovered(false);
        magneticElement.current = null;
      }
    };

    // Attach Listeners
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseLeaveWindow);
    document.addEventListener("mouseenter", handleMouseEnterWindow);
    window.addEventListener("mouseover", handleMouseOver, { passive: true });

    // 5. 60FPS Easing Physics Loop
    let animId: number;
    const tick = () => {
      const targetX = mousePos.current.x;
      const targetY = mousePos.current.y;

      // Calculate Target for Outer Ring (considering magnetic force field)
      let ringTargetX = targetX;
      let ringTargetY = targetY;

      if (magneticElement.current) {
        const rect = magneticElement.current.getBoundingClientRect();
        const elementCenterX = rect.left + rect.width / 2;
        const elementCenterY = rect.top + rect.height / 2;
        
        // Linear Interpolate toward element center based on force
        ringTargetX = targetX + (elementCenterX - targetX) * PHYSICS.magneticForce;
        ringTargetY = targetY + (elementCenterY - targetY) * PHYSICS.magneticForce;
      }

      if (motionQuery.matches) {
        // If reduced motion, snap immediately with zero easing/trailing
        dotPos.current.x = targetX;
        dotPos.current.y = targetY;
        ringPos.current.x = ringTargetX;
        ringPos.current.y = ringTargetY;
      } else {
        // Easing interpolation math
        dotPos.current.x += (targetX - dotPos.current.x) * PHYSICS.dotEasing;
        dotPos.current.y += (targetY - dotPos.current.y) * PHYSICS.dotEasing;

        ringPos.current.x += (ringTargetX - ringPos.current.x) * PHYSICS.ringEasing;
        ringPos.current.y += (ringTargetY - ringPos.current.y) * PHYSICS.ringEasing;
      }

      // Render styles using translate3d for GPU acceleration
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dotPos.current.x}px, ${dotPos.current.y}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Clean up
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeaveWindow);
      document.removeEventListener("mouseenter", handleMouseEnterWindow);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className={`custom-cursor-wrapper ${isHovered ? "hovered" : ""} ${
        isClicked ? "clicked" : ""
      }`}
      style={{ opacity: isVisible ? 1 : 0, transition: "opacity 0.25s ease" }}
    >
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" />
      <div ref={rippleRef} className="custom-cursor-ripple" />
    </div>
  );
}
