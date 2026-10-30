import { Trophy } from "lucide-react";
import { awards } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Awards() {
  return (
    <section className="section awards" id="prestasi">
      <div className="shell">
        <SectionHeading
          index="07"
          eyebrow="Prestasi"
          title={
            <>
              Disiplin yang <em>berbuah</em>.
            </>
          }
          description="Pengalaman di dunia pencak silat mengajarkan disiplin, ketahanan, dan kerja keras — nilai yang saya bawa ke setiap proyek kreatif."
        />

        <div className="awards__grid">
          {awards.map((award, index) => (
            <Reveal key={award.title} delay={index * 70} className="award-card">
              <div className="award-card__icon">
                <Trophy size={24} />
              </div>
              <span className="award-card__year">{award.year}</span>
              <h3>{award.title}</h3>
              <p className="award-card__scope">{award.scope}</p>
              <p className="award-card__desc">{award.description}</p>
            </Reveal>
          ))}

          <Reveal delay={150} className="award-card award-card--note">
            <p className="award-card__quote">
              “Kemenangan bukan hanya soal hasil, tetapi tentang proses latihan yang konsisten.”
            </p>
            <span className="award-card__sign">— Sa'rul Ibad</span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
