import { TvEye } from "./Icon";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo" aria-label="Sa'rul Ibad — Portfolio">
      <span className="logo__mark">
        <TvEye className="logo__eye" />
      </span>
      {!compact && (
        <span className="logo__text">
          <strong>Sa'rul Ibad</strong>
          <small>Creative Portfolio</small>
        </span>
      )}
    </span>
  );
}
