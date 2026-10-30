import { Moon, Sun } from "lucide-react";

export function ThemeToggle({
  theme,
  onToggle,
  className = "",
}: {
  theme: "dark" | "light";
  onToggle: () => void;
  className?: string;
}) {
  const next = theme === "dark" ? "terang" : "gelap";
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={onToggle}
      aria-label={`Aktifkan mode ${next}`}
      title={`Mode ${next}`}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
        </span>
      </span>
    </button>
  );
}
