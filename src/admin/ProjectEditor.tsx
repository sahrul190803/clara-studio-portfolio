import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  ImagePlus,
  Loader2,
  Star,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { Project } from "../data/portfolio";
import { ApiError, request, uploadImage, type AdminContent } from "./adminApi";

interface ProjectEditorProps {
  mode: "create" | "edit";
  project?: Project;
  categories: string[];
  onClose: () => void;
  onSaved: (content: AdminContent, message: string) => void;
  onApiError: (error: unknown) => void;
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ProjectEditor({
  mode,
  project,
  categories,
  onClose,
  onSaved,
  onApiError,
}: ProjectEditorProps) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [category, setCategory] = useState(project?.category ?? categories[0] ?? "");
  const [year, setYear] = useState(project?.year ?? String(new Date().getFullYear()));
  const [role, setRole] = useState(project?.role ?? "");
  const [cover, setCover] = useState(project?.cover ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [goals, setGoals] = useState((project?.goals ?? []).join("\n"));
  const [process, setProcess] = useState((project?.process ?? []).join("\n"));
  const [tools, setTools] = useState((project?.tools ?? []).join(", "));
  const [result, setResult] = useState(project?.result ?? "");
  const [featured, setFeatured] = useState(Boolean(project?.featured));
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, saving]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const uploaded = await uploadImage(file);
      setCover(uploaded.url);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onApiError(err);
      } else {
        setUploadError(
          err instanceof ApiError ? err.message : "Gagal mengunggah gambar. Coba lagi.",
        );
      }
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || uploading) return;
    if (!title.trim()) {
      setError("Judul proyek wajib diisi.");
      return;
    }
    if (!category) {
      setError("Pilih kategori proyek.");
      return;
    }
    if (!cover.trim()) {
      setError("Thumbnail proyek wajib diisi.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload = {
      title: title.trim(),
      category,
      year: year.trim(),
      role: role.trim(),
      cover: cover.trim(),
      summary: summary.trim(),
      description: description.trim(),
      goals: splitLines(goals),
      process: splitLines(process),
      tools: tools
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      result: result.trim(),
      featured,
    };

    try {
      const response =
        mode === "create"
          ? await request<{ content: AdminContent }>("/api/admin/projects", {
              method: "POST",
              body: JSON.stringify(payload),
            })
          : await request<{ content: AdminContent }>(
              `/api/admin/projects/${encodeURIComponent(project?.id ?? "")}`,
              {
                method: "PUT",
                body: JSON.stringify(payload),
              },
            );
      onSaved(
        response.content,
        mode === "create" ? "Proyek berhasil ditambahkan." : "Proyek berhasil diperbarui.",
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onApiError(err);
      } else {
        setError(err instanceof ApiError ? err.message : "Gagal menyimpan proyek.");
      }
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      className="admin-modal-overlay"
      onClick={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        className="admin-modal admin-modal--editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-editor-title"
      >
        <header className="admin-modal__head">
          <div>
            <p className="admin-modal__eyebrow">
              {mode === "create" ? "Proyek baru" : "Ubah proyek"}
            </p>
            <h2 id="project-editor-title">
              {mode === "create" ? "Tambah proyek" : "Edit proyek"}
            </h2>
          </div>
          <button
            type="button"
            className="admin-icon-btn"
            onClick={onClose}
            aria-label="Tutup editor"
          >
            <X size={18} />
          </button>
        </header>

        <div className="admin-editor">
          <form id="project-editor-form" className="admin-editor__form" onSubmit={submit}>
            {error && (
              <p className="admin-form-error" role="alert">
                {error}
              </p>
            )}

            <div className="admin-form-grid">
              <label className="admin-field admin-field--full">
                <span>Judul proyek *</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Contoh: Rebranding Feed Komunitas"
                  required
                />
              </label>
              <label className="admin-field">
                <span>Kategori *</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} required>
                  {categories.length === 0 && <option value="">Belum ada kategori</option>}
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-field">
                <span>Tahun</span>
                <input
                  value={year}
                  onChange={(event) => setYear(event.target.value)}
                  placeholder="2026"
                />
              </label>
              <label className="admin-field admin-field--full">
                <span>Peran</span>
                <input
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  placeholder="Desainer grafis & content planner"
                />
              </label>
            </div>

            <div className="admin-field admin-field--full">
              <span>Thumbnail *</span>
              <div
                className={`admin-upload ${dragActive ? "is-drag" : ""}`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragActive(false);
                  const file = event.dataTransfer.files?.[0];
                  if (file) void handleFile(file);
                }}
              >
                <div className="admin-upload__preview">
                  {cover ? (
                    <img src={cover} alt="Pratinjau thumbnail" />
                  ) : (
                    <span>
                      <ImagePlus size={22} />
                    </span>
                  )}
                </div>
                <div className="admin-upload__body">
                  <p>
                    {uploading
                      ? "Mengunggah gambar…"
                      : "Tarik gambar ke sini atau pilih dari perangkat"}
                  </p>
                  <small>JPG, PNG, WebP, GIF, atau AVIF. Maksimal 8 MB.</small>
                  <div className="admin-upload__actions">
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => fileInput.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 size={14} className="spin" /> : <UploadCloud size={14} />}
                      {uploading ? "Mengunggah…" : "Pilih gambar"}
                    </button>
                    {cover && (
                      <button
                        type="button"
                        className="admin-text-btn admin-text-btn--danger"
                        onClick={() => setCover("")}
                        disabled={uploading}
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    )}
                  </div>
                </div>
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void handleFile(file);
                  }}
                />
              </div>
              <input
                className="admin-field__sub"
                value={cover}
                onChange={(event) => setCover(event.target.value)}
                placeholder="atau tempel URL gambar di sini"
                aria-label="URL thumbnail"
              />
              {uploadError && (
                <p className="admin-form-error" role="alert">
                  {uploadError}
                </p>
              )}
            </div>

            <label className="admin-field admin-field--full">
              <span>Ringkasan *</span>
              <textarea
                rows={2}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Muncul di kartu proyek dan daftar galeri."
              />
            </label>

            <label className="admin-field admin-field--full">
              <span>Deskripsi lengkap</span>
              <textarea
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Ceritakan konteks, tujuan, dan hasil proyek."
              />
            </label>

            <div className="admin-form-grid">
              <label className="admin-field">
                <span>Tujuan proyek</span>
                <textarea
                  rows={3}
                  value={goals}
                  onChange={(event) => setGoals(event.target.value)}
                  placeholder={"Satu poin per baris\nContoh: Menyatukan identitas visual"}
                />
              </label>
              <label className="admin-field">
                <span>Proses pengerjaan</span>
                <textarea
                  rows={3}
                  value={process}
                  onChange={(event) => setProcess(event.target.value)}
                  placeholder={"Satu langkah per baris\nContoh: Riset dan moodboard"}
                />
              </label>
            </div>

            <label className="admin-field">
              <span>Tools</span>
              <input
                value={tools}
                onChange={(event) => setTools(event.target.value)}
                placeholder="Canva, Photoshop, Premiere Pro"
              />
              <small>Pisahkan dengan koma.</small>
            </label>

            <label className="admin-field admin-field--full">
              <span>Hasil akhir</span>
              <textarea
                rows={3}
                value={result}
                onChange={(event) => setResult(event.target.value)}
                placeholder="Dampak atau hasil yang dicapai."
              />
            </label>

            <label className="admin-featured">
              <input
                type="checkbox"
                checked={featured}
                onChange={(event) => setFeatured(event.target.checked)}
              />
              <span>
                <strong>
                  <Star size={13} /> Jadikan proyek unggulan
                </strong>
                <small>Proyek unggulan ditampilkan lebih besar di galeri publik.</small>
              </span>
            </label>
          </form>

          <aside className="admin-editor__preview">
            <p className="admin-editor__preview-label">Pratinjau kartu</p>
            <div className="admin-preview">
              <div className="admin-preview__cover">
                {cover ? (
                  <img src={cover} alt="" />
                ) : (
                  <span>
                    <ImagePlus size={24} />
                  </span>
                )}
              </div>
              <div className="admin-preview__body">
                <div className="admin-preview__meta">
                  <span>{category || "Kategori"}</span>
                  <span>{year || "Tahun"}</span>
                </div>
                <h3>{title || "Judul proyek"}</h3>
                <p>{summary || "Ringkasan singkat proyek akan tampil di sini."}</p>
                <span className="admin-preview__role">{role || "Peran Anda"}</span>
              </div>
            </div>
            <p className="admin-editor__note">
              Pratinjau ini hanya perkiraan. Hasil akhir di situs mengikuti komponen galeri
              publik.
            </p>
          </aside>
        </div>

        <footer className="admin-modal__foot">
          <span className="admin-modal__foot-meta">
            {mode === "edit" && project ? `ID: ${project.id}` : "Data disimpan di server lokal"}
          </span>
          <div className="admin-modal__foot-actions">
            <button type="button" className="btn btn--ghost btn--sm" onClick={onClose} disabled={saving}>
              Batal
            </button>
            <button
              type="submit"
              form="project-editor-form"
              className="btn btn--primary btn--sm"
              disabled={saving || uploading}
            >
              {saving
                ? "Menyimpan…"
                : mode === "create"
                  ? "Tambahkan proyek"
                  : "Simpan perubahan"}
            </button>
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
