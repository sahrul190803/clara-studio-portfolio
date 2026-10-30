import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Calendar, Layers, Maximize2, Target, Wrench, X } from "lucide-react";
import type { Project } from "../data/portfolio";
import { whatsappLink } from "../data/portfolio";
import { Lightbox } from "./Lightbox";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !zoomed) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, zoomed]);

  const content = (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal__panel">
        <div className="modal__bar">
          <span className="modal__bar-meta">
            <span>{project.category}</span>
            <i />
            <span>{project.year}</span>
          </span>
          <button
            type="button"
            className="modal__close"
            onClick={onClose}
            aria-label="Tutup detail proyek"
            ref={closeRef}
          >
            <X size={19} />
          </button>
        </div>

        <div className="modal__scroll">
          <button
            type="button"
            className="modal__cover"
            onClick={() => setZoomed(true)}
            aria-label={`Perbesar pratinjau ${project.title}`}
          >
            <img src={project.cover} alt={`Pratinjau proyek ${project.title}`} />
            <span className="modal__zoom">
              <Maximize2 size={15} /> Perbesar
            </span>
          </button>

          <div className="modal__content">
            <p className="eyebrow">{project.role}</p>
            <h2 className="modal__title" id="project-modal-title">
              {project.title}
            </h2>
            <p className="modal__lead">{project.description}</p>

            <div className="modal__facts">
              <div>
                <Calendar size={16} />
                <span>Tahun</span>
                <strong>{project.year}</strong>
              </div>
              <div>
                <Layers size={16} />
                <span>Kategori</span>
                <strong>{project.category}</strong>
              </div>
              <div>
                <Target size={16} />
                <span>Peran</span>
                <strong>{project.role}</strong>
              </div>
            </div>

            <section className="modal__section">
              <h3>Tujuan proyek</h3>
              <ul className="modal__list modal__list--check">
                {project.goals.map((goal) => (
                  <li key={goal}>{goal}</li>
                ))}
              </ul>
            </section>

            <section className="modal__section">
              <h3>Proses pengerjaan</h3>
              <ol className="modal__steps">
                {project.process.map((step, index) => (
                  <li key={step}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section className="modal__section">
              <h3>Hasil akhir</h3>
              <p className="modal__result">{project.result}</p>
            </section>

            <section className="modal__section">
              <h3>
                <Wrench size={16} /> Tools yang dipakai
              </h3>
              <ul className="modal__tools">
                {project.tools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </section>

            <div className="modal__cta">
              <div>
                <strong>Punya kebutuhan serupa?</strong>
                <p>Ceritakan ide Anda, kita cari solusi yang paling pas.</p>
              </div>
              <a
                className="btn btn--primary btn--sm"
                href={whatsappLink(
                  `Halo Sa'rul, saya melihat proyek "${project.title}" di portofolio Anda dan ingin berdiskusi tentang proyek serupa.`,
                )}
                target="_blank"
                rel="noreferrer noopener"
              >
                Diskusikan
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {zoomed && (
        <Lightbox
          src={project.cover}
          alt={`Pratinjau ${project.title}`}
          onClose={() => setZoomed(false)}
        />
      )}
    </div>
  );

  return createPortal(content, document.body);
}
