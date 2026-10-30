import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X, Mail, Instagram, MapPin } from "lucide-react";
import { navLinks, profile, whatsappLink } from "../data/portfolio";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar({
  theme,
  onToggleTheme,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks
      .map((link) => document.querySelector(link.href))
      .filter((el): el is Element => Boolean(el));
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("menu-open", open);
    return () => root.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""}`}>
        <div className="nav__inner shell">
          <a href="#top" className="nav__brand" aria-label="Kembali ke atas">
            <Logo />
          </a>

          <nav className="nav__links" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={active === link.href ? "is-active" : ""}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <a
              className="btn btn--primary btn--sm nav__cta"
              href={whatsappLink("Halo Sa'rul, saya ingin berdiskusi tentang proyek.")}
              target="_blank"
              rel="noreferrer noopener"
            >
              Hubungi
              <ArrowUpRight size={15} />
            </a>
            <button
              type="button"
              className="nav__burger"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Tutup menu" : "Buka menu"}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="mobile-menu__inner">
          <p className="eyebrow">Navigasi</p>
          <nav className="mobile-menu__links" aria-label="Navigasi seluler">
            {navLinks.map((link, i) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: `${i * 45}ms` }}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {link.label}
                <ArrowUpRight size={20} />
              </a>
            ))}
          </nav>
          <div className="mobile-menu__meta">
            <a href={`mailto:${profile.email}`}>
              <Mail size={16} /> {profile.email}
            </a>
            <a href={profile.instagramUrl} target="_blank" rel="noreferrer noopener">
              <Instagram size={16} /> @{profile.instagram}
            </a>
            <span>
              <MapPin size={16} /> {profile.location}
            </span>
          </div>
          <div className="mobile-menu__footer">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <span>Mode {theme === "dark" ? "gelap" : "terang"}</span>
          </div>
        </div>
      </div>
    </>
  );
}
