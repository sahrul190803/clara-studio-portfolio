import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
  children,
}: {
  index: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
}) {
  return (
    <div className={`section-heading section-heading--${align}`}>
      <Reveal className="section-heading__eyebrow">
        <span className="section-heading__index">{index}</span>
        <span className="eyebrow">{eyebrow}</span>
      </Reveal>
      <div className="section-heading__row">
        <Reveal delay={60}>
          <h2 className="section-heading__title">{title}</h2>
        </Reveal>
        {description && (
          <Reveal delay={120} className="section-heading__copy">
            <p>{description}</p>
            {children}
          </Reveal>
        )}
      </div>
    </div>
  );
}
