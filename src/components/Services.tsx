import { ArrowUpRight, Sparkles } from "lucide-react";
import { services, whatsappLink } from "../data/portfolio";
import { PortfolioIcon } from "./Icon";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Services() {
  return (
    <section className="section services" id="layanan">
      <div className="shell">
        <SectionHeading
          index="04"
          eyebrow="Layanan"
          title={
            <>
              Dari ide menjadi <em>karya</em>.
            </>
          }
          description="Layanan yang dapat disesuaikan dengan kebutuhan organisasi, UMKM, komunitas, maupun proyek pribadi."
        />

        <div className="services__grid">
          {services.map((service, index) => (
            <Reveal key={service.title} delay={index * 55} className="service-card">
              <div className="service-card__head">
                <span className="service-card__icon">
                  <PortfolioIcon name={service.icon} size={21} />
                </span>
                <span className="service-card__index">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul>
                {service.deliverables.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a
                className="service-card__link"
                href={whatsappLink(`Halo Sa'rul, saya ingin konsultasi tentang layanan ${service.title}.`)}
                target="_blank"
                rel="noreferrer noopener"
              >
                Konsultasi layanan
                <ArrowUpRight size={15} />
              </a>
            </Reveal>
          ))}

          <Reveal delay={330} className="service-card service-card--cta">
            <span className="service-card__spark">
              <Sparkles size={22} />
            </span>
            <h3>Punya kebutuhan lain?</h3>
            <p>
              Setiap proyek punya tantangannya sendiri. Ceritakan kebutuhan Anda, kita rancang
              pendekatan yang paling sesuai.
            </p>
            <a className="btn btn--primary btn--sm" href="#kontak">
              Diskusikan ide
              <ArrowUpRight size={15} />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
