import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  FolderKanban,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Star,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import type { Project } from "../data/portfolio";
import { Logo } from "../components/Logo";
import { ThemeToggle } from "../components/ThemeToggle";
import { ApiError, formatDate, request, type AdminContent } from "./adminApi";
import { CategoryManager } from "./CategoryManager";
import { ConfirmDialog } from "./ConfirmDialog";
import { ProjectEditor } from "./ProjectEditor";

type Tab = "projects" | "categories";
type EditorState = { mode: "create" | "edit"; project?: Project; key: number };
type Toast = { type: "success" | "error"; message: string };

export function AdminDashboard({
  theme,
  onToggleTheme,
  onLogout,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  const [content, setContent] = useState<AdminContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("projects");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const logoutRef = useRef(onLogout);
  logoutRef.current = onLogout;

  const notify = useCallback((type: Toast["type"], message: string) => {
    setToast({ type, message });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await request<AdminContent>("/api/admin/content");
      setContent(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logoutRef.current();
        return;
      }
      setLoadError(err instanceof ApiError ? err.message : "Tidak dapat memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (
      content &&
      categoryFilter !== "Semua" &&
      !content.categories.includes(categoryFilter)
    ) {
      setCategoryFilter("Semua");
    }
  }, [categoryFilter, content]);

  const reload = useCallback(async () => {
    const data = await request<AdminContent>("/api/admin/content");
    setContent(data);
  }, []);

  const handleApiError = useCallback(
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        logoutRef.current();
        return;
      }
      notify("error", error instanceof Error ? error.message : "Terjadi kesalahan.");
    },
    [notify],
  );

  const refresh = async () => {
    setRefreshing(true);
    try {
      await reload();
      notify("success", "Data berhasil dimuat ulang.");
    } catch (error) {
      handleApiError(error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredProjects = useMemo(() => {
    if (!content) return [];
    const needle = query.trim().toLowerCase();
    return content.projects.filter((project) => {
      const matchesCategory =
        categoryFilter === "Semua" || project.category === categoryFilter;
      const matchesQuery =
        !needle ||
        project.title.toLowerCase().includes(needle) ||
        project.category.toLowerCase().includes(needle) ||
        project.year.toLowerCase().includes(needle) ||
        project.summary.toLowerCase().includes(needle);
      return matchesCategory && matchesQuery;
    });
  }, [categoryFilter, content, query]);

  const reorderEnabled = !query.trim() && categoryFilter === "Semua";

  const move = async (id: string, direction: -1 | 1) => {
    if (!content || busyId) return;
    const index = content.projects.findIndex((project) => project.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= content.projects.length) return;
    const ids = content.projects.map((project) => project.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    setBusyId(id);
    try {
      const updated = await request<AdminContent>("/api/admin/reorder", {
        method: "PUT",
        body: JSON.stringify({ ids }),
      });
      setContent(updated);
    } catch (error) {
      handleApiError(error);
    } finally {
      setBusyId(null);
    }
  };

  const removeProject = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await request(`/api/admin/projects/${encodeURIComponent(confirmDelete.id)}`, {
        method: "DELETE",
      });
      await reload();
      notify("success", `Proyek "${confirmDelete.title}" dihapus.`);
      setConfirmDelete(null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setDeleting(false);
    }
  };

  const openCreate = () => {
    if (!content) return;
    setEditor({ mode: "create", key: Date.now() });
  };

  const openEdit = (project: Project) => {
    setEditor({ mode: "edit", project, key: Date.now() });
  };

  const handleSaved = (next: AdminContent, message: string) => {
    setContent(next);
    setEditor(null);
    notify("success", message);
  };

  const stats = content
    ? [
        {
          label: "Total proyek",
          value: String(content.projects.length),
          note: "Karya di galeri publik",
          icon: <FolderKanban size={18} />,
          small: false,
        },
        {
          label: "Proyek unggulan",
          value: String(content.projects.filter((project) => project.featured).length),
          note: "Tampil lebih besar",
          icon: <Star size={18} />,
          small: false,
        },
        {
          label: "Kategori",
          value: String(content.categories.length),
          note: "Filter galeri",
          icon: <Tags size={18} />,
          small: false,
        },
        {
          label: "Terakhir diperbarui",
          value: formatDate(content.updatedAt),
          note: "Waktu penyimpanan terakhir",
          icon: <RefreshCw size={18} />,
          small: true,
        },
      ]
    : [];

  return (
    <div className="admin">
      <div className="admin-layout">
        <aside className="admin-side">
          <a className="admin-brand" href="/" aria-label="Sa'rul Ibad — kembali ke situs">
            <Logo />
          </a>

          <p className="admin-side__label">Dashboard</p>
          <nav className="admin-nav" aria-label="Navigasi dashboard">
            <button
              type="button"
              className={tab === "projects" ? "is-active" : ""}
              onClick={() => setTab("projects")}
            >
              <FolderKanban size={17} />
              <span>Proyek</span>
              <em>{content?.projects.length ?? 0}</em>
            </button>
            <button
              type="button"
              className={tab === "categories" ? "is-active" : ""}
              onClick={() => setTab("categories")}
            >
              <Tags size={17} />
              <span>Kategori</span>
              <em>{content?.categories.length ?? 0}</em>
            </button>
          </nav>

          <div className="admin-side__bottom">
            <a href="/" target="_blank" rel="noreferrer noopener">
              <ExternalLink size={16} /> Lihat situs
            </a>
            <a href="/api/admin/export">
              <Download size={16} /> Ekspor data
            </a>
            <div className="admin-side__theme">
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
              <span>Mode {theme === "dark" ? "gelap" : "terang"}</span>
            </div>
            <button type="button" className="admin-side__logout" onClick={onLogout}>
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </aside>

        <main className="admin-main">
          <header className="admin-header">
            <div>
              <p className="eyebrow">Dashboard admin · Sa'rul Ibad</p>
              <h1>{tab === "projects" ? "Kelola proyek" : "Kelola kategori"}</h1>
              <p>
                {tab === "projects"
                  ? "Tambah karya, perbarui thumbnail dan deskripsi, lalu atur urutan tampilannya di galeri."
                  : "Atur filter kategori yang muncul di galeri portofolio publik."}
              </p>
            </div>
            {tab === "projects" && (
              <button
                type="button"
                className="btn btn--primary btn--sm"
                onClick={openCreate}
                disabled={!content}
              >
                <Plus size={15} /> Tambah proyek
              </button>
            )}
          </header>

          {loading && !content ? (
            <div className="admin-loading" role="status">
              <RefreshCw size={20} className="spin" />
              <span>Memuat data dashboard…</span>
            </div>
          ) : loadError && !content ? (
            <div className="admin-panel admin-panel--error">
              <AlertCircle size={22} />
              <h2>Data belum bisa dimuat</h2>
              <p>{loadError}</p>
              <button type="button" className="btn btn--primary btn--sm" onClick={() => void load()}>
                <RefreshCw size={15} /> Coba lagi
              </button>
            </div>
          ) : (
            <>
              <section className="admin-stats" aria-label="Ringkasan konten">
                {stats.map((stat) => (
                  <div className="admin-stat" key={stat.label}>
                    <span className="admin-stat__icon">{stat.icon}</span>
                    <span className="admin-stat__label">{stat.label}</span>
                    <strong className={stat.small ? "is-small" : ""}>{stat.value}</strong>
                    <span className="admin-stat__note">{stat.note}</span>
                  </div>
                ))}
              </section>

              {tab === "projects" ? (
                <div className="admin-panel">
                  <div className="admin-panel__head">
                    <div>
                      <h2>Daftar proyek</h2>
                      <p>Urutan di sini menentukan urutan kartu pada galeri publik.</p>
                    </div>
                    <span className="admin-badge">{filteredProjects.length} tampil</span>
                  </div>

                  <div className="admin-toolbar">
                    <label className="admin-search">
                      <Search size={15} />
                      <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Cari judul, kategori, atau tahun…"
                        aria-label="Cari proyek"
                      />
                      {query && (
                        <button
                          type="button"
                          className="admin-search__clear"
                          onClick={() => setQuery("")}
                          aria-label="Hapus pencarian"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </label>
                    <select
                      className="admin-select"
                      value={categoryFilter}
                      onChange={(event) => setCategoryFilter(event.target.value)}
                      aria-label="Filter kategori"
                    >
                      <option value="Semua">Semua kategori</option>
                      {content?.categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-icon-btn"
                      onClick={() => void refresh()}
                      aria-label="Muat ulang data"
                      disabled={refreshing}
                    >
                      <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                    </button>
                  </div>

                  {content && content.projects.length === 0 ? (
                    <div className="admin-empty">
                      <FolderKanban size={28} />
                      <h3>Belum ada proyek</h3>
                      <p>Tambahkan karya pertama agar galeri portofolio mulai terisi.</p>
                      <button type="button" className="btn btn--primary btn--sm" onClick={openCreate}>
                        <Plus size={15} /> Tambah proyek pertama
                      </button>
                    </div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="admin-empty">
                      <Search size={26} />
                      <h3>Tidak ada hasil</h3>
                      <p>Coba kata kunci atau filter kategori lain.</p>
                    </div>
                  ) : (
                    <ul className="admin-projects">
                      {filteredProjects.map((project) => {
                        const index = content?.projects.findIndex((item) => item.id === project.id) ?? -1;
                        const total = content?.projects.length ?? 0;
                        return (
                          <li className="admin-project" key={project.id}>
                            <div className="admin-project__thumb">
                              {project.cover ? <img src={project.cover} alt="" loading="lazy" /> : null}
                            </div>
                            <div className="admin-project__main">
                              <div className="admin-project__title">
                                <h3>{project.title}</h3>
                                {project.featured && (
                                  <span className="admin-badge admin-badge--clay">
                                    <Star size={11} /> Unggulan
                                  </span>
                                )}
                              </div>
                              <p className="admin-project__meta">
                                <span>{project.category}</span>
                                <i />
                                <span>{project.year}</span>
                              </p>
                              <p className="admin-project__summary">{project.summary}</p>
                            </div>
                            <div className="admin-project__actions">
                              {reorderEnabled && (
                                <div className="admin-project__move">
                                  <button
                                    type="button"
                                    className="admin-icon-btn"
                                    onClick={() => void move(project.id, -1)}
                                    disabled={index <= 0 || busyId !== null}
                                    aria-label={`Naikkan ${project.title}`}
                                  >
                                    <ChevronUp size={16} />
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-icon-btn"
                                    onClick={() => void move(project.id, 1)}
                                    disabled={index === total - 1 || busyId !== null}
                                    aria-label={`Turunkan ${project.title}`}
                                  >
                                    <ChevronDown size={16} />
                                  </button>
                                </div>
                              )}
                              <button
                                type="button"
                                className="admin-icon-btn"
                                onClick={() => openEdit(project)}
                                aria-label={`Edit ${project.title}`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                type="button"
                                className="admin-icon-btn admin-icon-btn--danger"
                                onClick={() => setConfirmDelete(project)}
                                aria-label={`Hapus ${project.title}`}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                content && (
                  <CategoryManager
                    content={content}
                    onContent={setContent}
                    onSuccess={(message) => notify("success", message)}
                    onApiError={handleApiError}
                  />
                )
              )}
            </>
          )}
        </main>
      </div>

      {editor && content && (
        <ProjectEditor
          key={editor.key}
          mode={editor.mode}
          project={editor.project}
          categories={content.categories}
          onClose={() => setEditor(null)}
          onSaved={handleSaved}
          onApiError={handleApiError}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title={`Hapus "${confirmDelete.title}"?`}
          message="Proyek akan dihapus dari galeri publik. Tindakan ini tidak bisa dibatalkan."
          confirmLabel="Hapus proyek"
          busy={deleting}
          onConfirm={() => void removeProject()}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && (
        <div className={`admin-toast admin-toast--${toast.type}`} role="status">
          {toast.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Tutup notifikasi">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
