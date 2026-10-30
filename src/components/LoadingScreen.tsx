import { useEffect, useState } from "react";
import { profile } from "../data/portfolio";
import { TvEye } from "./Icon";

export function LoadingScreen({
  progress,
  ready,
}: {
  progress: number;
  ready: boolean;
}) {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("is-loading");
    return () => document.documentElement.classList.remove("is-loading");
  }, []);

  useEffect(() => {
    if (!ready) return;
    const t1 = window.setTimeout(() => setDone(true), 450);
    const t2 = window.setTimeout(() => setHidden(true), 1250);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [ready]);

  if (hidden) return null;

  const value = Math.max(4, Math.min(100, Math.round(progress || (ready ? 100 : 0))));

  return (
    <div className={`loader ${done ? "is-done" : ""}`} role="status" aria-live="polite">
      <div className="loader__inner">
        <div className="loader__mark">
          <TvEye className="loader__eye" />
        </div>
        <p className="loader__eyebrow">Creative Portfolio · 2026</p>
        <h1 className="loader__name">{profile.name}</h1>
        <p className="loader__role">Menyiapkan studio &amp; asisten suara</p>
        <div className="loader__bar" aria-hidden="true">
          <span style={{ width: `${value}%` }} />
        </div>
        <div className="loader__meta">
          <span>{value}%</span>
          <span>Memuat model 3D</span>
        </div>
      </div>
    </div>
  );
}
