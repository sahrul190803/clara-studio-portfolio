import { useEffect, useState } from "react";
import { PlugZap, RefreshCw } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import { TvEye } from "../components/Icon";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLogin } from "./AdminLogin";
import { request } from "./adminApi";
import "./admin.css";

type AdminState = "loading" | "setup" | "login" | "authed" | "offline";

export default function AdminApp({
  theme,
  onToggleTheme,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  const [state, setState] = useState<AdminState>("loading");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    request<{ configured: boolean; authenticated: boolean }>("/api/admin/status")
      .then((data) => {
        if (cancelled) return;
        if (data.authenticated) setState("authed");
        else if (data.configured) setState("login");
        else setState("setup");
      })
      .catch(() => {
        if (!cancelled) setState("offline");
      });
    return () => {
      cancelled = true;
    };
  }, [retry]);

  useEffect(() => {
    const previous = document.title;
    document.title = "Dashboard Admin — Sa'rul Ibad";
    return () => {
      document.title = previous;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await request("/api/admin/logout", { method: "POST" });
    } catch {
      /* cookie may already be gone */
    }
    setState("login");
  };

  if (state === "loading") {
    return (
      <div className="admin-boot">
        <span className="admin-boot__mark">
          <TvEye />
        </span>
        <p>Memuat dashboard…</p>
      </div>
    );
  }

  if (state === "offline") {
    return (
      <div className="admin-auth">
        <div className="admin-auth__halo" aria-hidden="true" />
        <div className="admin-auth__grid" aria-hidden="true" />
        <div className="admin-auth__card">
          <span className="admin-auth__mark">
            <TvEye />
          </span>
          <p className="admin-auth__eyebrow">
            <PlugZap size={13} /> Tidak terhubung
          </p>
          <h1>Server admin belum aktif</h1>
          <p className="admin-auth__lead">
            Jalankan server lokal terlebih dahulu dengan <code>npm run serve</code> (atau
            <code> npm run api</code> saat mode pengembangan), lalu coba lagi.
          </p>
          <button
            type="button"
            className="btn btn--primary admin-auth__submit"
            onClick={() => setRetry((value) => value + 1)}
          >
            <RefreshCw size={15} /> Coba lagi
          </button>
          <a className="admin-auth__back admin-auth__back--inline" href="/">
            Kembali ke portofolio
          </a>
        </div>
        <span className="admin-theme-fab">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </span>
      </div>
    );
  }

  if (state === "authed") {
    return (
      <AdminDashboard
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <>
      <AdminLogin
        mode={state === "setup" ? "setup" : "login"}
        onSuccess={() => setState("authed")}
      />
      <span className="admin-theme-fab">
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </span>
    </>
  );
}
