import type { ReactNode } from "react";
import {
  Award,
  Camera,
  Code2,
  FileSpreadsheet,
  FolderKanban,
  GraduationCap,
  Palette,
  Radio,
  Share2,
  Video,
  Briefcase,
  Users,
} from "lucide-react";

const icons = {
  palette: Palette,
  video: Video,
  camera: Camera,
  sheet: FileSpreadsheet,
  code: Code2,
  share: Share2,
  broadcast: Radio,
  award: Award,
  education: GraduationCap,
  experience: Briefcase,
  organization: Users,
  project: FolderKanban,
};

export type IconName = keyof typeof icons;

export function PortfolioIcon({
  name,
  size = 20,
  strokeWidth = 1.7,
  className,
}: {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Cmp = icons[name as IconName] ?? FolderKanban;
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} aria-hidden="true" />;
}

export function TvEye({ className }: { className?: string }): ReactNode {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect
        x="5"
        y="13"
        width="54"
        height="40"
        rx="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        opacity=".75"
      />
      <g className="tv-eye__eyes">
        <path
          d="M12.5 32.5 Q19 26.2 25.5 32.5 Q19 38.8 12.5 32.5 Z"
          fill="currentColor"
          opacity=".92"
        />
        <path
          d="M38.5 32.5 Q45 26.2 51.5 32.5 Q45 38.8 38.5 32.5 Z"
          fill="currentColor"
          opacity=".92"
        />
        <circle cx="19" cy="32.5" r="3.1" fill="var(--bg, #121211)" />
        <circle cx="45" cy="32.5" r="3.1" fill="var(--bg, #121211)" />
        <circle cx="17.8" cy="31.2" r="1.1" fill="currentColor" />
        <circle cx="43.8" cy="31.2" r="1.1" fill="currentColor" />
      </g>
      <path d="M24 13V8M40 13V8" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}
