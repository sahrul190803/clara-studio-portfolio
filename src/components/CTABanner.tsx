import { ArrowUpRight, Mail, Sparkles } from "lucide-react";
import { profile, whatsappLink } from "../data/portfolio";
import { TvEye } from "./Icon";
import { Reveal } from "./Reveal";

export function CTABanner() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="shell">
        <Reveal className="cta__card">
          <div className="cta__decor" aria-hidden="true">
            <span className="cta__ring" />
            <span className="cta__ring cta__ring--two" />
            <TvEye className="cta__eye" />
          </div>
          <p className="eyebrow">
            <Sparkles size={13} /> Kolaborasi
          </p>
          <h2 id="cta-title">
            Punya proyek? <em>Mari bekerja sama.</em>
          </h2>
          <p className="cta__lead">
            Dari desain konten, dokumentasi acara, hingga website sederhana — mari ubah ide Anda
            menjadi sesuatu yang bisa dilihat, digunakan, dan diingat.
          </p>
          <div className="cta__actions">
            <a
              className="btn btn--primary"
              href={whatsappLink("Halo Sa'rul, saya punya proyek yang ingin didiskusikan.")}
              target="_blank"
              rel="noreferrer noopener"
            >
              Mulai lewat WhatsApp
              <ArrowUpRight size={16} />
            </a>
            <a className="btn btn--ghost" href={`mailto:${profile.email}`}>
              <Mail size={16} />
              Kirim email
            </a>
          </div>
          <p className="cta__meta">
            <span className="status-dot" /> {profile.availability}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
