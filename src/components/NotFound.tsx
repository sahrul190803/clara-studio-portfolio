import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { TvEye } from "./Icon";

export function NotFound() {
  return (
    <main className="notfound">
      <div className="notfound__inner">
        <a className="notfound__brand" href="/" aria-label="Sa'rul Ibad — Beranda">
          <TvEye className="notfound__logo" />
          <span>Sa'rul Ibad</span>
        </a>
        <div className="notfound__decor" aria-hidden="true">
          <span className="notfound__ring" />
          <span className="notfound__ring notfound__ring--two" />
          <TvEye className="notfound__eye" />
        </div>
        <p className="notfound__code">404</p>
        <h1>Halaman tidak ditemukan</h1>
        <p className="notfound__lead">
          Tautan yang Anda buka mungkin sudah dipindahkan atau tidak pernah ada. Clara juga sudah
          mencari, tapi layarnya kosong.
        </p>
        <div className="notfound__actions">
          <a className="btn btn--primary" href="/">
            <ArrowLeft size={16} /> Kembali ke Beranda
          </a>
          <a className="btn btn--ghost" href="/#kontak">
            Hubungi Sa'rul <ArrowUpRight size={16} />
          </a>
        </div>
        <p className="notfound__meta">Portofolio Sa'rul Ibad · 2026</p>
      </div>
    </main>
  );
}
