import { ArrowUpRight, Download, Sparkles } from "lucide-react";
import { profile, whatsappLink } from "../data/portfolio";
import type { StageState } from "../stage";
import type { RefObject } from "react";
import { ClaraStage } from "./ClaraStage";
import { Reveal } from "./Reveal";
import { VoicePanel } from "./VoicePanel";

export function Hero({
  stageRef,
  onProgress,
  onReady,
}: {
  stageRef: RefObject<StageState>;
  onProgress: (value: number) => void;
  onReady: () => void;
}) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__aura" aria-hidden="true" />
      <div className="hero__inner shell">
        <div className="hero__copy">
          <Reveal className="hero__badge">
            <span className="status-dot" />
            <span>{profile.availability}</span>
          </Reveal>

          <Reveal delay={50}>
            <p className="hero__kicker">
              <Sparkles size={13} aria-hidden="true" />
              <span>Asisten suara</span>
            </p>
          </Reveal>

          <Reveal delay={90}>
            <h1 className="hero__title hero__title--greeting" id="hero-title">
              Hai, saya <em>Sa&apos;rul.</em>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="hero__lead hero__lead--tagline">
              Suara ramah untuk ide Anda selanjutnya.
            </p>
          </Reveal>
        </div>

        <div className="hero__stage">
          <ClaraStage stateRef={stageRef} onProgress={onProgress} onReady={onReady} />
        </div>

        <div className="hero__voice">
          <Reveal delay={190}>
            <VoicePanel stageRef={stageRef} />
          </Reveal>

          <Reveal delay={240}>
            <div className="hero__quick">
              <a href="#proyek">
                Lihat proyek
                <ArrowUpRight size={14} />
              </a>
              <a
                href={whatsappLink("Halo Sa'rul, saya ingin berdiskusi.")}
                target="_blank"
                rel="noreferrer noopener"
              >
                Hubungi Sa&apos;rul
              </a>
              <a href={profile.cv} download>
                <Download size={13} />
                Unduh CV
              </a>
            </div>
          </Reveal>
        </div>
      </div>

      <a className="hero__scroll" href="#tentang" aria-label="Gulir ke bagian tentang">
        <span>Gulir untuk menjelajah</span>
        <span className="hero__scroll-line" aria-hidden="true">
          <i />
        </span>
      </a>
    </section>
  );
}
