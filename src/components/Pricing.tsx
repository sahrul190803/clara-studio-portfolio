import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { pricing, whatsappLink } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Pricing() {
  return (
    <section className="section pricing" id="paket">
      <div className="shell">
        <SectionHeading
          index="05"
          eyebrow="Paket Jasa"
          title={
            <>
              Pilih titik <em>mulai</em>.
            </>
          }
          description="Paket di bawah adalah gambaran lingkup kerja. Harga dan detail akhir disesuaikan dengan kebutuhan, durasi, dan tingkat kesulitan proyek."
        />

        <div className="pricing__grid">
          {pricing.map((plan, index) => (
            <Reveal
              key={plan.name}
              delay={index * 70}
              className={`price-card ${plan.highlight ? "price-card--highlight" : ""}`}
            >
              {plan.highlight && (
                <span className="price-card__badge">
                  <Sparkles size={13} /> Paling diminati
                </span>
              )}
              <p className="price-card__kicker">Paket {String(index + 1).padStart(2, "0")}</p>
              <h3>{plan.name}</h3>
              <p className="price-card__desc">{plan.description}</p>
              <p className="price-card__price">
                Minta penawaran
                <small>Konsultasi awal gratis</small>
              </p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} /> {feature}
                  </li>
                ))}
              </ul>
              <a
                className={`btn ${plan.highlight ? "btn--primary" : "btn--ghost"} btn--sm`}
                href={whatsappLink(`Halo Sa'rul, saya tertarik dengan ${plan.name}. Boleh minta penawarannya?`)}
                target="_blank"
                rel="noreferrer noopener"
              >
                Minta penawaran
                <ArrowUpRight size={15} />
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal className="pricing__note">
          <p>
            Harga menyesuaikan lingkup pekerjaan. Untuk proyek organisasi, pesantren, atau
            komunitas, silakan diskusikan penyesuaian yang memungkinkan.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
