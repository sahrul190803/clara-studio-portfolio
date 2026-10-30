# Sa'rul Ibad — Creative Portfolio

Portofolio interaktif Sa'rul Ibad: mahasiswa Teknik Informatika sekaligus kreator media digital di Tasikmalaya. Model 3D TV-head dari Clara Studio tetap dipertahankan sebagai asisten virtual, dengan suara dari **Fish Audio Agent** milik Sa'rul Ibad.

## Fitur

- Hero sinematik dengan model 3D `clara-rigged.glb` dan animasi idle/gesture.
- Asisten suara **Clara** lewat Fish Audio (text chat + mikrofon + transkrip).
- Dark/light mode, loading screen, custom cursor, scroll progress.
- Tentang, keahlian, galeri proyek dengan filter, detail proyek, lightbox.
- Layanan, paket jasa, timeline pendidikan/pengalaman, prestasi, testimoni.
- FAQ, CTA, formulir kontak (WhatsApp/email), footer, halaman 404.
- Unduh CV, tombol WhatsApp, back-to-top, animasi reveal dan hover.
- Responsif untuk desktop, tablet, dan ponsel.

## Menjalankan

```bash
npm install
npm run dev
```

Vite akan membuka `http://localhost:5173`.

Build produksi:

```bash
npm run build
```

Hasil build ada di folder `out/`. Untuk melihat hasil produksi secara lokal:

```bash
python -m http.server 5173 --directory out
```

atau

```bash
npm run preview
```

## Integrasi Fish Audio

Agent ID ada di `src/data/portfolio.ts`:

```ts
export const AGENT_ID = "cf4e48eaf2f3456fa6f20656b0e04353";
```

Agar suara bisa tersambung, agent harus:

1. Sudah **published** di Fish Audio.
2. **Public access** aktif (Agent → Deploy).
3. Origin situs terdaftar di **Allowed origins** dengan format persis `scheme://host:port`, misalnya:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
   - domain produksi, misalnya `https://portofolio-sarul.vercel.app`

`localhost` dan `127.0.0.1` dianggap origin berbeda. Dokumentasi: <https://docs.fish.audio/agents/deploy/public-agents>.

Jika origin belum terdaftar, panel Clara menampilkan pesan yang menyebutkan origin yang perlu ditambahkan.

## Mengubah Konten

- Data profil, proyek, keahlian, layanan, timeline, testimoni, FAQ, paket: `src/data/portfolio.ts`.
- Foto profil: `public/images/sarul-ibad.png`.
- CV: `public/cv/sarul-ibad-cv.pdf`.
- Sampul proyek: `public/images/cover-*.svg` (dapat diganti dengan gambar asli).
- Model 3D: `public/models/clara-rigged.glb`.
- Gambar OG: `public/images/og.png` (sumber `public/images/og.svg`).
- Warna dan tipografi: variabel CSS di bagian atas `src/styles.css`.

> Catatan: detail proyek, testimoni, dan beberapa penanggalan pengalaman disusun sebagai draf konten. Silakan ganti dengan data dan ulasan asli sebelum dipublikasikan.

## Teknologi

React 19 · TypeScript · Vite 6 · Three.js · Fish Audio Agent SDK · Lucide Icons.

---

© 2026 Sa'rul Ibad. Model 3D Clara Studio dipertahankan sebagai bagian dari identitas visual.
