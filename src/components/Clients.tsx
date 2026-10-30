import { clients } from "../data/portfolio";
import { Reveal } from "./Reveal";

export function Clients() {
  return (
    <section className="clients" aria-label="Organisasi dan kolaborasi">
      <div className="shell clients__inner">
        <p className="clients__label">
          Kolaborasi &amp; organisasi
        </p>
        <ul className="clients__list">
          {clients.map((client, index) => (
            <Reveal as="li" key={client} delay={index * 45}>
              <span>{client}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
