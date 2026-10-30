import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function Lightbox({
  src,
  alt,
  onClose,
}: {
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Pratinjau ${alt}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button type="button" className="lightbox__close" onClick={onClose} aria-label="Tutup pratinjau">
        <X size={22} />
      </button>
      <figure className="lightbox__figure">
        <img src={src} alt={alt} />
        <figcaption>{alt}</figcaption>
      </figure>
    </div>,
    document.body,
  );
}
