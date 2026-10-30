import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Clock,
  Download,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import { profile, whatsappLink } from "../data/portfolio";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const topics = [
  "Desain konten & branding",
  "Video & dokumentasi",
  "Live streaming",
  "Administrasi & data",
  "Website sederhana",
  "Lainnya",
];

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<"wa" | "mail" | null>(null);

  const buildMessage = () =>
    `Halo Sa'rul,\n\nNama: ${name}\nEmail: ${email}\nTopik: ${topic}\n\n${message}`;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !message.trim()) return;
    window.open(whatsappLink(buildMessage()), "_blank", "noopener");
    setSent("wa");
  };

  const sendMail = () => {
    if (!name.trim() || !message.trim()) return;
    const subject = `Proyek baru: ${topic}`;
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(buildMessage())}`;
    setSent("mail");
  };

  return (
    <section className="section contact" id="kontak">
      <div className="shell">
        <SectionHeading
          index="10"
          eyebrow="Kontak"
          title={
            <>
              Mari mulai <em>percakapan</em>.
            </>
          }
          description="Ceritakan sedikit tentang proyek atau kebutuhan Anda. Saya akan merespons secepat mungkin pada jam kerja."
        />

        <div className="contact__grid">
          <div className="contact__info">
            <Reveal>
              <a className="contact-card" href={`mailto:${profile.email}`}>
                <span className="contact-card__icon">
                  <Mail size={19} />
                </span>
                <span>
                  <small>Email</small>
                  <strong>{profile.email}</strong>
                </span>
                <ArrowUpRight size={16} className="contact-card__arrow" />
              </a>
            </Reveal>

            <Reveal delay={60}>
              <a
                className="contact-card"
                href={whatsappLink("Halo Sa'rul, saya ingin bertanya.")}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="contact-card__icon">
                  <MessageCircle size={19} />
                </span>
                <span>
                  <small>WhatsApp</small>
                  <strong>{profile.phoneDisplay}</strong>
                </span>
                <ArrowUpRight size={16} className="contact-card__arrow" />
              </a>
            </Reveal>

            <Reveal delay={120}>
              <a
                className="contact-card"
                href={profile.instagramUrl}
                target="_blank"
                rel="noreferrer noopener"
              >
                <span className="contact-card__icon">
                  <Instagram size={19} />
                </span>
                <span>
                  <small>Instagram</small>
                  <strong>@{profile.instagram}</strong>
                </span>
                <ArrowUpRight size={16} className="contact-card__arrow" />
              </a>
            </Reveal>

            <Reveal delay={180}>
              <div className="contact-card contact-card--static">
                <span className="contact-card__icon">
                  <MapPin size={19} />
                </span>
                <span>
                  <small>Lokasi</small>
                  <strong>{profile.location}</strong>
                </span>
              </div>
            </Reveal>

            <Reveal delay={230} className="contact__availability">
              <Clock size={16} />
              <div>
                <strong>Waktu respons</strong>
                <span>Sekitar 1×24 jam pada hari kerja</span>
              </div>
            </Reveal>

            <Reveal delay={270}>
              <a className="btn btn--ghost btn--sm contact__cv" href={profile.cv} download>
                <Download size={15} />
                Unduh CV (PDF)
              </a>
            </Reveal>
          </div>

          <Reveal delay={100} className="contact__form-wrap">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="contact-form__row">
                <label>
                  <span>Nama</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setSent(null);
                    }}
                    placeholder="Nama Anda"
                    required
                    autoComplete="name"
                  />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setSent(null);
                    }}
                    placeholder="nama@email.com"
                    autoComplete="email"
                  />
                </label>
              </div>

              <label>
                <span>Topik</span>
                <select value={topic} onChange={(event) => setTopic(event.target.value)}>
                  {topics.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Pesan</span>
                <textarea
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    setSent(null);
                  }}
                  rows={5}
                  placeholder="Ceritakan kebutuhan, target waktu, dan hasil yang Anda bayangkan…"
                  required
                />
              </label>

              <div className="contact-form__actions">
                <button type="submit" className="btn btn--primary btn--sm">
                  <Send size={15} />
                  Kirim via WhatsApp
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={sendMail}>
                  <Mail size={15} />
                  Kirim via Email
                </button>
              </div>

              {sent && (
                <p className="contact-form__note" role="status">
                  {sent === "wa"
                    ? "Pesan telah disiapkan di WhatsApp. Jika tab tidak terbuka, izinkan pop-up lalu coba lagi."
                    : "Aplikasi email Anda sedang dibuka dengan pesan yang sudah terisi."}
                </p>
              )}
              <p className="contact-form__hint">
                Dengan mengirim pesan, Anda setuju untuk dihubungi kembali melalui email atau
                WhatsApp.
              </p>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
