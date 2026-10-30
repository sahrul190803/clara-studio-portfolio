import { ArrowUp, Instagram, Mail, MessageCircle } from "lucide-react";
import { navLinks, profile, services } from "../data/portfolio";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="footer">
      <div className="shell">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#top" aria-label="Kembali ke atas">
              <Logo />
            </a>
            <p>
              Portofolio karya dan layanan Sa'rul Ibad — desain konten, dokumentasi, live
              streaming, administrasi data, dan web sederhana.
            </p>
            <div className="footer__social">
              <a
                href={profile.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram Sa'rul Ibad"
              >
                <Instagram size={17} />
              </a>
              <a href={`mailto:${profile.email}`} aria-label="Kirim email">
                <Mail size={17} />
              </a>
              <a
                href={`https://wa.me/${profile.whatsapp}`}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="WhatsApp Sa'rul Ibad"
              >
                <MessageCircle size={17} />
              </a>
            </div>
          </div>

          <nav className="footer__nav" aria-label="Navigasi footer">
            <p className="footer__label">Navigasi</p>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="footer__nav">
            <p className="footer__label">Layanan</p>
            {services.map((service) => (
              <a key={service.title} href="#layanan">
                {service.title}
              </a>
            ))}
          </div>

          <div className="footer__contact">
            <p className="footer__label">Mulai dari sini</p>
            <p>Ada ide atau kebutuhan? Kirim pesan, kita diskusikan.</p>
            <a className="btn btn--primary btn--sm" href="#kontak">
              Hubungi saya
            </a>
            <a className="footer__mail" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Sa'rul Ibad. Hak cipta dilindungi.</p>
          <p className="footer__credit">
            Dibangun dengan React, Three.js &amp; Fish Audio · Asisten: Clara
          </p>
          <button
            type="button"
            className="footer__top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <ArrowUp size={15} /> Ke atas
          </button>
        </div>
      </div>
    </footer>
  );
}
