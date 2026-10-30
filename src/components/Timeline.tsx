import { timeline, type TimelineType } from "../data/portfolio";
import { PortfolioIcon } from "./Icon";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const labels: Record<TimelineType, string> = {
  pendidikan: "Pendidikan",
  pengalaman: "Pengalaman",
  organisasi: "Organisasi",
  proyek: "Proyek pribadi",
};

export function Timeline() {
  return (
    <section className="section timeline-section" id="pengalaman">
      <div className="shell">
        <SectionHeading
          index="06"
          eyebrow="Pendidikan & Pengalaman"
          title={
            <>
              Perjalanan yang <em>membentuk</em>.
            </>
          }
          description="Rekam jejak pendidikan, pengalaman kerja, organisasi, dan proyek pribadi yang membentuk cara saya bekerja."
        />

        <div className="timeline">
          {timeline.map((item, index) => (
            <Reveal key={`${item.title}-${item.period}`} delay={index * 40} className="timeline__item">
              <div className="timeline__rail" aria-hidden="true">
                <span className="timeline__dot">
                  <PortfolioIcon name={item.type} size={13} />
                </span>
              </div>
              <div className="timeline__card">
                <div className="timeline__head">
                  <span className="timeline__period">{item.period}</span>
                  <span className={`timeline__type timeline__type--${item.type}`}>
                    {labels[item.type]}
                  </span>
                </div>
                <h3>{item.title}</h3>
                <p className="timeline__org">{item.organization}</p>
                <p className="timeline__desc">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
