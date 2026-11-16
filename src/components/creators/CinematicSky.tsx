import { useEffect, useRef } from "react";
import cityDay from "@/assets/city-day.jpg";
import cityNight from "@/assets/city-night.jpg";

/** Fixed background: scrolling down turns dawn into night, scrolling up brings the sunrise back. */
export function CinematicSky({ onPhase }: { onPhase?: (p: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let target = 0;
    let current = 0;
    let raf = 0;
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const tick = () => {
      // Eased follow so the light changes like real time, not a slider
      current += (target - current) * 0.06;
      if (Math.abs(target - current) < 0.0005) current = target;
      ref.current?.style.setProperty("--p", current.toFixed(4));
      onPhase?.(current);
      raf = requestAnimationFrame(tick);
    };
    read();
    window.addEventListener("scroll", read, { passive: true });
    window.addEventListener("resize", read);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", read);
      window.removeEventListener("resize", read);
    };
  }, [onPhase]);

  return (
    <div ref={ref} className="sky" aria-hidden>
      <div className="layer day" style={{ backgroundImage: `url(${cityDay})` }} />
      <div className="layer night" style={{ backgroundImage: `url(${cityNight})` }} />
      <div className="layer dusk" />
      <div className="stars" />
      <div className="sun" />
      <div className="moon" />
      <div className="clouds" />
      <svg className="birds" width="70" height="24" viewBox="0 0 70 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M2 10q5-6 10 0q5-6 10 0" /><path d="M30 4q4-4 8 0q4-4 8 0" /><path d="M48 16q4-4 8 0q4-4 8 0" />
      </svg>
      <div className="drone"><svg viewBox="0 0 34 14" fill="currentColor">
        <rect x="12" y="5" width="10" height="4" rx="2" /><rect x="0" y="2" width="12" height="1.5" rx=".7" /><rect x="22" y="2" width="12" height="1.5" rx=".7" />
      </svg><i /></div>
      <div className="haze" />
    </div>
  );
}
