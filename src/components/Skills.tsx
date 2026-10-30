import { skills } from "../data/portfolio";
import { PortfolioIcon } from "./Icon";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const marqueeTools = [
  "Canva",
  "CorelDRAW",
  "Photoshop",
  "Premiere Pro",
  "OBS Studio",
  "Excel",
  "Google Sheets",
  "HTML",
  "CSS",
  "JavaScript",
  "Word",
  "PowerPoint",
];

export function Skills() {
  return (
    <section className="section skills" id="keahlian">
      <div className="shell">
        <SectionHeading
          index="02"
          eyebrow="Keahlian & Tools"
          title={
            <>
              Kemampuan yang <em>terus diasah</em>.
            </>
          }
          description="Kombinasi keterampilan visual, teknis, dan administratif yang saling melengkapi dalam mengerjakan sebuah proyek dari awal hingga selesai."
        />

        <div className="skills__grid">
          {skills.map((skill, index) => (
            <Reveal key={skill.title} delay={index * 55} className="skill-card">
              <div className="skill-card__top">
                <span className="skill-card__icon">
                  <PortfolioIcon name={skill.icon} size={21} />
                </span>
                <span className="skill-card__index">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{skill.title}</h3>
              <p>{skill.description}</p>
              <ul className="skill-card__tools">
                {skill.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          {[...marqueeTools, ...marqueeTools].map((tool, index) => (
            <span key={`${tool}-${index}`}>
              {tool}
              <i />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
