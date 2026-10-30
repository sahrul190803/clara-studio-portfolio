import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { TvEye } from "../components/Icon";
import { ApiError, request } from "./adminApi";

export function AdminLogin({
  mode,
  onSuccess,
}: {
  mode: "setup" | "login";
  onSuccess: () => void;
}) {
  const setup = mode === "setup";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (setup && password !== confirm) {
      setError("Konfirmasi kata sandi belum sama.");
      return;
    }
    if (setup && password.length < 8) {
      setError("Kata sandi minimal 8 karakter.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await request(setup ? "/api/admin/setup" : "/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(
          "Tidak dapat terhubung ke server admin. Pastikan server berjalan (npm run serve).",
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-auth">
      <div className="admin-auth__halo" aria-hidden="true" />
      <div className="admin-auth__grid" aria-hidden="true" />

      <a className="admin-auth__back" href="/">
        <ArrowLeft size={15} /> Kembali ke portofolio
      </a>

      <div className="admin-auth__card">
        <span className="admin-auth__mark">
          <TvEye />
        </span>
        <p className="admin-auth__eyebrow">
          <ShieldCheck size={13} /> {setup ? "Penyiapan awal" : "Area pemilik"}
        </p>
        <h1>{setup ? "Buat kata sandi admin" : "Masuk ke dashboard"}</h1>
        <p className="admin-auth__lead">
          {setup
            ? "Kata sandi ini melindungi dashboard pengelolaan proyek. Simpan baik-baik — tidak ada pemulihan otomatis."
            : "Masukkan kata sandi admin untuk mengelola proyek, kategori, dan thumbnail portofolio."}
        </p>

        <form className="admin-auth__form" onSubmit={submit}>
          <label className="admin-field">
            <span>Kata sandi</span>
            <span className="admin-input-wrap">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(null);
                }}
                placeholder={setup ? "Minimal 8 karakter" : "Kata sandi admin"}
                autoComplete={setup ? "new-password" : "current-password"}
                autoFocus
                required
                minLength={setup ? 8 : undefined}
              />
              <button
                type="button"
                className="admin-input-toggle"
                onClick={() => setShow((value) => !value)}
                aria-label={show ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </span>
          </label>

          {setup && (
            <label className="admin-field">
              <span>Ulangi kata sandi</span>
              <span className="admin-input-wrap">
                <input
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(event) => {
                    setConfirm(event.target.value);
                    setError(null);
                  }}
                  placeholder="Ketik ulang kata sandi"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </span>
            </label>
          )}

          {error && (
            <p className="admin-form-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn--primary admin-auth__submit" disabled={busy}>
            {busy ? "Memproses…" : setup ? "Simpan & mulai" : "Masuk"}
          </button>
        </form>

        <p className="admin-auth__hint">
          {setup
            ? "Setelah tersimpan, buka /admin kapan saja untuk mengelola konten."
            : "Lupa kata sandi? Hapus data/admin.json lalu muat ulang untuk mengatur ulang."}
        </p>
      </div>
    </div>
  );
}
