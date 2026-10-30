import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { useContent } from "../content/ContentProvider";
import type { Project } from "../data/portfolio";
import { ProjectModal } from "./ProjectModal";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

function ProjectCard({
  project,
  wide = false,
  onOpen,
  index,
}: {
  project: Project;
  wide?: boolean;
  onOpen: (project: Project) => void;
  index: number;
}) {
  return (
    <Reveal
      as="article"
      delay={Math.min(index, 5) * 60}
      className={`project-card ${wide ? "project-card--wide" : ""}`}
    >
      <div className="project-card__cover">
        <img
          src={project.cover}
          alt={`Sampul proyek ${project.title}`}
          loading="lazy"
          width={1200}
          height={900}
        />
        <span className="project-card__scrim" aria-hidden="true" />
        <span className="project-card__tag">{project.category}</span>
        <span className="project-card__year">{project.year}</span>
      </div>
      <div className="project-card__body">
        <div className="project-card__title-row">
          <h3>{project.title}</h3>
          <span className="project-card__arrow" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <p>{project.summary}</p>
        <div className="project-card__foot">
          <span>{project.role}</span>
          <span className="project-card__more">Lihat detail</span>
        </div>
      </div>
      <button
        type="button"
        className="project-card__hit"
        onClick={() => onOpen(project)}
        aria-label={`Lihat detail proyek ${project.title}`}
      />
    </Reveal>
  );
}

export function Projects() {
  const { projects, categories } = useContent();
  const [filter, setFilter] = useState("Semua");
  const [selected, setSelected] = useState<Project | null>(null);

  const filters = useMemo(() => ["Semua", ...categories], [categories]);

  useEffect(() => {
    if (filter !== "Semua" && !categories.includes(filter)) {
      setFilter("Semua");
    }
  }, [categories, filter]);

  const featured = useMemo(() => projects.filter((project) => project.featured), [projects]);
  const rest = useMemo(() => projects.filter((project) => !project.featured), [projects]);
  const filtered = useMemo(
    () =>
      filter === "Semua" ? projects : projects.filter((project) => project.category === filter),
    [filter, projects],
  );

  const counts = useMemo(
    () =>
      filters.reduce<Record<string, number>>((acc, category) => {
        acc[category] =
          category === "Semua"
            ? projects.length
            : projects.filter((project) => project.category === category).length;
        return acc;
      }, {}),
    [filters, projects],
  );

  return (
    <section className="section projects" id="proyek">
      <div className="shell">
        <SectionHeading
          index="03"
          eyebrow="Galeri Portofolio"
          title={
            <>
              Karya yang <em>terpilih</em>.
            </>
          }
          description="Sebagian proyek dan kegiatan yang saya kerjakan — dari desain konten, produksi video, administrasi data, hingga halaman web sederhana."
        />

        <div className="projects__toolbar">
          <div className="projects__filters" role="group" aria-label="Filter kategori proyek">
            <SlidersHorizontal size={15} aria-hidden="true" />
            {filters.map((category) => (
              <button
                key={category}
                type="button"
                className={filter === category ? "is-active" : ""}
                onClick={() => setFilter(category)}
                aria-pressed={filter === category}
              >
                {category}
                <span>{counts[category]}</span>
              </button>
            ))}
          </div>
          <p className="projects__count">
            {String(filtered.length).padStart(2, "0")} karya
            {filter !== "Semua" ? ` · ${filter}` : " · pilihan"}
          </p>
        </div>

        {filter === "Semua" ? (
          <>
            <div className="projects__featured">
              {featured.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  wide={index === 0}
                  onOpen={setSelected}
                  index={index}
                />
              ))}
            </div>
            <div className="projects__grid">
              {rest.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={setSelected}
                  index={index}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="projects__grid projects__grid--filtered">
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={setSelected}
                index={index}
              />
            ))}
          </div>
        )}

        <Reveal className="projects__note">
          <p>
            Ingin melihat proses atau file lengkap? Setiap proyek dapat didiskusikan lebih lanjut.
          </p>
          <a className="text-link" href="#kontak">
            Mulai diskusi <ArrowUpRight size={15} />
          </a>
        </Reveal>
      </div>

      {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
