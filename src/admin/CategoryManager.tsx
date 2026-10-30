import { useState, type FormEvent } from "react";
import { Check, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { ApiError, request, type AdminContent } from "./adminApi";

export function CategoryManager({
  content,
  onContent,
  onSuccess,
  onApiError,
}: {
  content: AdminContent;
  onContent: (content: AdminContent) => void;
  onSuccess: (message: string) => void;
  onApiError: (error: unknown) => void;
}) {
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirm, setConfirm] = useState<{ name: string; count: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleError = (err: unknown, fallback: string) => {
    if (err instanceof ApiError && err.status === 401) {
      onApiError(err);
      return;
    }
    setError(err instanceof ApiError ? err.message : fallback);
  };

  const countFor = (name: string) =>
    content.projects.filter((project) => project.category === name).length;

  const add = async (event: FormEvent) => {
    event.preventDefault();
    const name = newName.trim();
    if (name.length < 2) {
      setError("Nama kategori minimal 2 karakter.");
      return;
    }
    setBusy("add");
    setError(null);
    try {
      const updated = await request<AdminContent>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      onContent(updated);
      setNewName("");
      onSuccess(`Kategori "${name}" ditambahkan.`);
    } catch (err) {
      handleError(err, "Gagal menambahkan kategori.");
    } finally {
      setBusy(null);
    }
  };

  const saveRename = async (event: FormEvent, oldName: string) => {
    event.preventDefault();
    const name = editValue.trim();
    if (name.length < 2) {
      setError("Nama kategori minimal 2 karakter.");
      return;
    }
    setBusy(`rename:${oldName}`);
    setError(null);
    try {
      const updated = await request<AdminContent>(
        `/api/admin/categories/${encodeURIComponent(oldName)}`,
        { method: "PUT", body: JSON.stringify({ name }) },
      );
      onContent(updated);
      setEditing(null);
      onSuccess(`Kategori diubah menjadi "${name}".`);
    } catch (err) {
      handleError(err, "Gagal mengubah kategori.");
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (!confirm) return;
    setDeleting(true);
    setError(null);
    try {
      const suffix = confirm.count > 0 ? "?force=1" : "";
      const updated = await request<AdminContent>(
        `/api/admin/categories/${encodeURIComponent(confirm.name)}${suffix}`,
        { method: "DELETE" },
      );
      onContent(updated);
      onSuccess(`Kategori "${confirm.name}" dihapus.`);
      setConfirm(null);
    } catch (err) {
      handleError(err, "Gagal menghapus kategori.");
      setConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <div>
          <h2>Kategori proyek</h2>
          <p>Kategori dipakai sebagai filter di galeri publik.</p>
        </div>
        <span className="admin-badge">{content.categories.length} kategori</span>
      </div>

      <form className="admin-category-add" onSubmit={add}>
        <label className="admin-field admin-field--inline">
          <span className="sr-only">Nama kategori baru</span>
          <input
            value={newName}
            onChange={(event) => {
              setNewName(event.target.value);
              setError(null);
            }}
            placeholder="Nama kategori baru"
            maxLength={40}
          />
        </label>
        <button type="submit" className="btn btn--primary btn--sm" disabled={busy === "add"}>
          <Plus size={15} /> Tambah kategori
        </button>
      </form>

      {error && (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      )}

      <ul className="admin-categories">
        {content.categories.map((category) => {
          const count = countFor(category);
          const isEditing = editing === category;
          return (
            <li className="admin-category" key={category}>
              <span className="admin-category__icon">
                <Tag size={15} />
              </span>

              {isEditing ? (
                <form
                  className="admin-category__edit"
                  onSubmit={(event) => void saveRename(event, category)}
                >
                  <input
                    value={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                    autoFocus
                    maxLength={40}
                    aria-label={`Nama baru untuk kategori ${category}`}
                  />
                  <button
                    type="submit"
                    className="admin-icon-btn admin-icon-btn--positive"
                    aria-label="Simpan nama kategori"
                    disabled={busy === `rename:${category}`}
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    className="admin-icon-btn"
                    aria-label="Batal mengubah nama"
                    onClick={() => setEditing(null)}
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <>
                  <div className="admin-category__main">
                    <strong>{category}</strong>
                    <span>{count} proyek</span>
                  </div>
                  <div className="admin-category__actions">
                    <button
                      type="button"
                      className="admin-icon-btn"
                      aria-label={`Ubah nama kategori ${category}`}
                      onClick={() => {
                        setEditing(category);
                        setEditValue(category);
                        setError(null);
                      }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn--danger"
                      aria-label={`Hapus kategori ${category}`}
                      onClick={() => setConfirm({ name: category, count })}
                      disabled={content.categories.length <= 1}
                      title={
                        content.categories.length <= 1
                          ? "Minimal harus ada satu kategori"
                          : undefined
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <p className="admin-panel__note">
        Menghapus kategori yang masih dipakai akan memindahkan proyeknya ke kategori
        &ldquo;Lainnya&rdquo; agar tidak ada karya yang kehilangan filter.
      </p>

      {confirm && (
        <ConfirmDialog
          title={`Hapus kategori "${confirm.name}"?`}
          message={
            confirm.count > 0
              ? `${confirm.count} proyek akan dipindahkan ke kategori "Lainnya" sebelum kategori ini dihapus.`
              : "Kategori ini tidak dipakai proyek mana pun. Tindakan ini tidak bisa dibatalkan."
          }
          confirmLabel="Hapus kategori"
          busy={deleting}
          onConfirm={() => void remove()}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
