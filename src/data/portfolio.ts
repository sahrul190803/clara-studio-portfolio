import content from "../../data/content.json";

export const AGENT_ID = "cf4e48eaf2f3456fa6f20656b0e04353";

export const profile = {
  name: "Sa'rul Ibad",
  firstName: "Sa'rul",
  lastName: "Ibad",
  role: "Creative Media & Web Enthusiast",
  tagline: "Merancang cerita visual, konten, dan pengalaman digital yang rapi dan berkarakter.",
  location: "Tasikmalaya, Jawa Barat, Indonesia",
  email: "sarulibad@gmail.com",
  phone: "085856921627",
  phoneDisplay: "0858 5692 1627",
  whatsapp: "6285856921627",
  instagram: "ahhrull",
  instagramUrl: "https://instagram.com/ahhrull",
  cv: "/cv/sarul-ibad-cv.pdf",
  photo: "/images/sarul-ibad.png",
  availability: "Terbuka untuk proyek freelance & kolaborasi",
};

export const whatsappLink = (message?: string) =>
  `https://wa.me/${profile.whatsapp}${
    message ? `?text=${encodeURIComponent(message)}` : ""
  }`;

export type Category = string;
export interface Project {
  id: string;
  title: string;
  category: string;
  year: string;
  cover: string;
  summary: string;
  description: string;
  role: string;
  goals: string[];
  process: string[];
  tools: string[];
  result: string;
  featured?: boolean;
}

export const categories: string[] = content.categories;
export const projects: Project[] = content.projects as Project[];

export interface Skill {
  icon: string;
  title: string;
  description: string;
  tools: string[];
}

export const skills: Skill[] = [
  {
    icon: "palette",
    title: "Desain Grafis",
    description:
      "Menyusun identitas visual, konten media sosial, poster, dan materi promosi yang konsisten.",
    tools: ["Canva", "CorelDRAW", "Photoshop", "Adobe"],
  },
  {
    icon: "video",
    title: "Videografi & Editing",
    description:
      "Produksi video kegiatan, aftermovie, dan siaran langsung dengan alur kerja yang rapi.",
    tools: ["Kamera", "Premiere Pro", "OBS", "Audio"],
  },
  {
    icon: "camera",
    title: "Fotografi",
    description:
      "Liputan foto kegiatan dengan perhatian pada komposisi, cahaya, dan konsistensi warna.",
    tools: ["DSLR", "Lightroom", "Retouch"],
  },
  {
    icon: "sheet",
    title: "Administrasi & Data",
    description:
      "Penataan data, rekap otomatis, validasi, dan penyusunan laporan yang mudah dipahami.",
    tools: ["Word", "Excel", "PowerPoint", "Google Sheets"],
  },
  {
    icon: "code",
    title: "Web Dasar",
    description:
      "Membangun halaman web responsif dengan struktur HTML, CSS, dan JavaScript dasar.",
    tools: ["HTML", "CSS", "JavaScript", "VS Code"],
  },
  {
    icon: "share",
    title: "Media Sosial & Komunikasi",
    description:
      "Mengelola konten, interaksi audiens, dan strategi sederhana untuk meningkatkan engagement.",
    tools: ["Content Plan", "Copywriting", "Analytics"],
  },
];

export interface Service {
  icon: string;
  title: string;
  description: string;
  deliverables: string[];
}

export const services: Service[] = [
  {
    icon: "palette",
    title: "Desain Konten & Branding",
    description:
      "Desain feed, poster, carousel, dan materi promosi dengan sistem visual yang konsisten.",
    deliverables: ["Konsep visual", "Template konten", "File siap publikasi"],
  },
  {
    icon: "video",
    title: "Editing Video & Aftermovie",
    description:
      "Pengolahan footage kegiatan menjadi video yang enak ditonton dan sesuai kebutuhan publikasi.",
    deliverables: ["Penyuntingan", "Color grading", "Musik & audio"],
  },
  {
    icon: "broadcast",
    title: "Live Streaming & Dokumentasi",
    description:
      "Produksi siaran langsung multi-kamera serta dokumentasi foto untuk acara dan kegiatan.",
    deliverables: ["Setup perangkat", "Operasi siaran", "Rekaman acara"],
  },
  {
    icon: "sheet",
    title: "Data Entry & Administrasi",
    description:
      "Penataan data, rekap spreadsheet, validasi, dan laporan yang siap digunakan tim.",
    deliverables: ["Pembersihan data", "Formula rekap", "Laporan rapi"],
  },
  {
    icon: "code",
    title: "Pembuatan Website Sederhana",
    description:
      "Landing page atau profil organisasi yang responsif, ringan, dan mudah dikembangkan.",
    deliverables: ["Desain halaman", "Implementasi responsif", "Panduan dasar"],
  },
];

export type TimelineType = "pendidikan" | "pengalaman" | "organisasi" | "proyek";

export interface TimelineItem {
  type: TimelineType;
  period: string;
  title: string;
  organization: string;
  description: string;
}

export const timeline: TimelineItem[] = [
  {
    type: "pendidikan",
    period: "2022 — 2026",
    title: "S1 Teknik Informatika",
    organization: "STMIK DCI Tasikmalaya",
    description:
      "Menempuh studi informatika sambil aktif mengembangkan kemampuan media digital dan organisasi.",
  },
  {
    type: "organisasi",
    period: "2024 — Sekarang",
    title: "Wakil Ketua 1",
    organization: "Pimpinan Cabang IPNU Kota Tasikmalaya",
    description:
      "Mendampingi kepemimpinan organisasi, mengoordinasikan program, dan berkolaborasi lintas divisi.",
  },
  {
    type: "pengalaman",
    period: "2022 — Sekarang",
    title: "Freelance Live Streaming & Fotografer",
    organization: "Berbagai acara & organisasi",
    description:
      "Mengoperasikan sistem live streaming serta mengambil dan mengolah foto untuk dokumentasi dan promosi.",
  },
  {
    type: "pengalaman",
    period: "2024",
    title: "Freelance Recording Sertifikasi PPG",
    organization: "Kegiatan sertifikasi guru",
    description:
      "Bertanggung jawab pada perekaman kegiatan, pengelolaan kamera, dan kualitas audio visual.",
  },
  {
    type: "pengalaman",
    period: "2023 — 2024",
    title: "Admin Media Sosial",
    organization: "Komunitas & lembaga",
    description:
      "Mengelola konten dan interaksi platform media sosial serta meningkatkan engagement melalui strategi konten sederhana.",
  },
  {
    type: "pendidikan",
    period: "2019 — 2022",
    title: "Teknik Komputer & Jaringan",
    organization: "SMK Bustanul Ulum",
    description:
      "Mempelajari dasar jaringan komputer, perangkat keras, dan pemanfaatan teknologi sehari-hari.",
  },
  {
    type: "organisasi",
    period: "2022 — 2023",
    title: "Ketua PK IPNU",
    organization: "SMK Bustanul Ulum",
    description:
      "Memimpin program kaderisasi dan kegiatan keagamaan di lingkungan sekolah.",
  },
  {
    type: "proyek",
    period: "2025",
    title: "Website Portofolio Interaktif",
    organization: "Proyek pribadi",
    description:
      "Membangun website portofolio dengan model 3D, animasi, dan asisten suara berbasis Fish Audio.",
  },
];

export const awards = [
  {
    year: "2019",
    title: "Juara 1 Open Pencak Silat",
    scope: "Se-Jawa Barat",
    description:
      "Meraih juara pertama pada kejuaraan pencak silat terbuka tingkat Provinsi Jawa Barat.",
  },
  {
    year: "2018",
    title: "Juara 3 Pencak Silat",
    scope: "Se-Priangan Timur",
    description:
      "Meraih juara ketiga pada kejuaraan pencak silat wilayah Priangan Timur.",
  },
];

export const testimonials = [
  {
    quote:
      "Sa'rul cepat tanggap saat diminta menangani dokumentasi acara. Hasil fotonya rapi dan komunikatif, terutama untuk kebutuhan publikasi.",
    name: "Rekan Divisi Media",
    role: "Organisasi kepemudaan",
  },
  {
    quote:
      "Koordinasi selama live streaming berjalan tenang. Ia teliti menyiapkan perangkat dan sigap ketika ada perubahan susunan acara.",
    name: "Ketua Panitia",
    role: "Kegiatan sertifikasi",
  },
  {
    quote:
      "Desain kontennya konsisten dan mudah dipahami. Proses revisi juga jelas, sehingga hasil akhirnya sesuai dengan yang dibutuhkan.",
    name: "Klien Freelance",
    role: "Pengelola media sosial",
  },
];

export const clients = [
  "STMIK DCI",
  "SMK Bustanul Ulum",
  "PC IPNU Tasikmalaya",
  "Sertifikasi PPG",
  "Bustanul Ulum",
];

export const stats = [
  { value: 3, suffix: "+", label: "Tahun berkarya" },
  { value: 10, suffix: "+", label: "Proyek & kegiatan" },
  { value: 5, suffix: "", label: "Bidang kreatif" },
  { value: 9, suffix: "+", label: "Tools dikuasai" },
];

export const faqs = [
  {
    q: "Apakah bisa mengerjakan proyek secara remote?",
    a: "Bisa. Diskusi, pengiriman materi, dan revisi dapat dilakukan secara online. Untuk kebutuhan dokumentasi atau live streaming di Tasikmalaya dan sekitarnya, saya bisa hadir langsung.",
  },
  {
    q: "Berapa lama waktu pengerjaan satu proyek?",
    a: "Desain konten biasanya 1–3 hari kerja, editing video 3–7 hari kerja, dan website sederhana 1–2 minggu tergantung kompleksitas serta kelengkapan materi.",
  },
  {
    q: "Berapa kali revisi yang diberikan?",
    a: "Umumnya 2–3 kali revisi untuk setiap proyek. Revisi tambahan di luar lingkup awal dapat didiskusikan terlebih dahulu agar hasil tetap sesuai kebutuhan.",
  },
  {
    q: "Format file apa yang akan saya terima?",
    a: "Menyesuaikan kebutuhan: JPG/PNG/PDF untuk desain, MP4 untuk video, dan file sumber dapat diminta untuk keperluan tertentu. Semua file dikirim melalui Google Drive atau tautan yang disepakati.",
  },
  {
    q: "Bagaimana sistem pembayarannya?",
    a: "Pembayaran menggunakan uang muka 50% di awal dan pelunasan setelah proyek selesai. Nominal dan tahapan akan disepakati sebelum pekerjaan dimulai.",
  },
  {
    q: "Apakah menerima proyek untuk organisasi atau pesantren?",
    a: "Tentu. Saya banyak terlibat dengan kegiatan organisasi dan pesantren, sehingga paham kebutuhan dokumentasi, publikasi, dan administrasi yang sering diperlukan.",
  },
];

export const pricing = [
  {
    name: "Konten Visual",
    description: "Cocok untuk kebutuhan feed dan promosi rutin.",
    features: [
      "Konsep & sistem visual",
      "Desain konten (feed/poster)",
      "Caption dasar",
      "File siap publikasi",
    ],
    highlight: false,
  },
  {
    name: "Video & Dokumentasi",
    description: "Untuk acara, kegiatan, dan konten video.",
    features: [
      "Perencanaan pengambilan gambar",
      "Perekaman multi-angle",
      "Editing & color grading",
      "Aftermovie 60–90 detik",
    ],
    highlight: true,
  },
  {
    name: "Web & Data",
    description: "Untuk organisasi yang butuh halaman atau rekap rapi.",
    features: [
      "Desain halaman responsif",
      "Implementasi HTML/CSS/JS",
      "Form & struktur konten",
      "Panduan penggunaan dasar",
    ],
    highlight: false,
  },
];

export const navLinks = [
  { href: "#tentang", label: "Tentang" },
  { href: "#keahlian", label: "Keahlian" },
  { href: "#proyek", label: "Proyek" },
  { href: "#layanan", label: "Layanan" },
  { href: "#pengalaman", label: "Pengalaman" },
  { href: "#kontak", label: "Kontak" },
];
