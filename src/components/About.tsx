import { ArrowUpRight, Download, MapPin, Quote } from "lucide-react";
import { profile, whatsappLink } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const interests = ["Teknologi", "Media Digital", "Komunikasi Visual", "Fotografi", "Web"];

export function About() {
  return (
    <section className="section about" id="tentang">
      <div className="shell">
        <SectionHeading
          index="01"
          eyebrow="Tentang Saya"
          title={
            <>
              Kreator di balik <em>layar</em>.
            </>
          }
          description="Perpaduan antara rasa ingin tahu di bidang teknologi dan ketertarikan pada cerita visual. Saya menikmati proses mengubah ide sederhana menjadi karya yang rapi dan bermakna."
        />

        <div className="about__grid">
          <Reveal className="about__visual">
            <figure className="about__portrait">
              <img
                src={profile.photo}
                alt="Foto Sa'rul Ibad"
                width={1179}
                height={1300}
                loading="lazy"
              />
              <figcaption>
                <span className="about__portrait-dot" />
                Sa'rul Ibad · Tasikmalaya
              </figcaption>
            </figure>
            <div className="about__badge">
              <span>S1 Teknik Informatika</span>
              <small>STMIK DCI · 2022—2026</small>
            </div>
            <span className="about__frame" aria-hidden="true" />
          </Reveal>

          <div className="about__content">
            <Reveal delay={80}>
              <p className="about__lead">
                Mahasiswa <strong>Teknik Informatika</strong> yang juga aktif sebagai santri di
                Pondok Pesantren Bustanul Ulum Tasikmalaya. Berangkat dari ketertarikan pada
                teknologi, media digital, dan komunikasi visual.
              </p>
            </Reveal>

            <Reveal delay={130}>
              <p>
                Saya terbiasa bekerja mandiri maupun dalam tim, dengan kemampuan komunikasi yang
                baik. Pengalaman produksi konten — mulai dari fotografi, live streaming, hingga
                pengelolaan media sosial — membentuk cara saya melihat detail, ritme, dan kebutuhan
                audiens.
              </p>
            </Reveal>

            <Reveal delay={180}>
              <p>
                Bagi saya, karya yang baik bukan hanya terlihat menarik, tetapi juga jelas tujuan
                dan mudah digunakan. Saya terus belajar agar dapat menghubungkan estetika, proses
                teknis, dan kebutuhan nyata di lapangan.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <blockquote className="about__quote">
                <Quote size={20} aria-hidden="true" />
                <p>
                  Disiplin, adaptif, dan berkomitmen untuk terus belajar serta berkembang secara
                  profesional.
                </p>
              </blockquote>
            </Reveal>

            <Reveal delay={260}>
              <ul className="about__tags" aria-label="Minat profesional">
                {interests.map((interest) => (
                  <li key={interest}>{interest}</li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={300}>
              <dl className="about__facts">
                <div>
                  <dt>Domisili</dt>
                  <dd>
                    <MapPin size={13} /> Tasikmalaya, Jawa Barat
                  </dd>
                </div>
                <div>
                  <dt>Fokus</dt>
                  <dd>Media, desain &amp; web</dd>
                </div>
                <div>
                  <dt>Bahasa</dt>
                  <dd>Indonesia · Inggris · Arab</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className="about__status">
                    <span className="status-dot" /> Terbuka untuk kolaborasi
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={340}>
              <div className="about__actions">
                <a
                  className="btn btn--primary btn--sm"
                  href={whatsappLink("Halo Sa'rul, saya ingin berkenalan dan berdiskusi.")}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Mari berkenalan
                  <ArrowUpRight size={15} />
                </a>
                <a className="btn btn--ghost btn--sm" href={profile.cv} download>
                  <Download size={15} />
                  Unduh CV
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
