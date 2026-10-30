import { Quote } from "lucide-react";
import { testimonials } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Testimonials() {
  return (
    <section className="section testimonials" id="testimoni">
      <div className="shell">
        <SectionHeading
          index="08"
          eyebrow="Testimoni"
          title={
            <>
              Kata mereka yang <em>terlibat</em>.
            </>
          }
          description="Ulasan dari rekan kerja, panitia, dan klien yang pernah berkolaborasi dalam proyek media dan dokumentasi."
        />

        <div className="testimonials__grid">
          {testimonials.map((item, index) => (
            <Reveal key={item.quote} delay={index * 70} className="testimonial-card">
              <Quote size={26} className="testimonial-card__quote" aria-hidden="true" />
              <p>{item.quote}</p>
              <div className="testimonial-card__author">
                <span className="testimonial-card__avatar">
                  {item.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")
                    .slice(0, 2)}
                </span>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
