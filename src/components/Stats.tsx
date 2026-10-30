import { useEffect, useRef, useState } from "react";
import { stats } from "../data/portfolio";

function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const duration = 1300;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const step = (now: number) => {
          if (!start) start = now;
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span className="stat__value" ref={ref}>
      {display}
      <span>{suffix}</span>
    </span>
  );
}

export function Stats() {
  return (
    <section className="stats" aria-label="Ringkasan angka">
      <div className="shell stats__inner">
        {stats.map((stat, index) => (
          <div className="stat" key={stat.label}>
            <span className="stat__index">{String(index + 1).padStart(2, "0")}</span>
            <Counter value={stat.value} suffix={stat.suffix} />
            <span className="stat__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
