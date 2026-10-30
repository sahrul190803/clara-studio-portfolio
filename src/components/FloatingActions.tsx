import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { whatsappLink } from "../data/portfolio";

export function FloatingActions() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`floating ${visible ? "is-visible" : ""}`}>
      <a
        className="floating__btn floating__btn--wa"
        href={whatsappLink("Halo Sa'rul, saya menemukan portofolio Anda dan ingin bertanya.")}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Chat WhatsApp"
      >
        <MessageCircle size={19} />
        <span className="floating__label">WhatsApp</span>
      </a>
      <button
        type="button"
        className="floating__btn"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Kembali ke atas"
      >
        <ArrowUp size={19} />
      </button>
    </div>
  );
}
