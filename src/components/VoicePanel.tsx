import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type RefObject,
} from "react";
import {
  AgentAudioVisualizer,
  FishAgentError,
  useAgentMessages,
  useConversation,
} from "@fishaudio/agent-react";
import {
  ArrowUp,
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AGENT_ID } from "../data/portfolio";
import type { StageState } from "../stage";
import { TvEye } from "./Icon";

const suggestions = [
  "Apa keahlian utama Sa'rul?",
  "Tunjukkan proyek terbaiknya",
  "Layanan apa yang tersedia?",
  "Bagaimana cara menghubunginya?",
];

function describeError(error: unknown) {
  if (error instanceof FishAgentError) {
    if (error.code === "agent_not_public")
      return "Agent Fish Audio belum dapat diakses publik. Buka Fish Audio Console → Agent → Deploy, aktifkan Public access, lalu publish agent.";
    if (error.code === "origin_forbidden")
      return `Domain ${window.location.origin} belum diizinkan. Buka Fish Audio Console → Agent → Deploy → Allowed origins, lalu tambahkan ${window.location.origin}.`;
    if (error.code === "mic_permission_denied")
      return "Izin mikrofon ditolak. Anda tetap bisa mengetik pertanyaan.";
    if (error.code === "session_request_failed")
      return "Tidak dapat menghubungi Fish Audio. Periksa koneksi lalu coba lagi.";
  }
  if (error instanceof Error) {
    if (/permission/i.test(error.message))
      return "Izin mikrofon ditolak. Anda tetap bisa mengetik pertanyaan.";
    return error.message;
  }
  return "Terjadi kendala saat menyambung ke asisten suara. Coba lagi.";
}

export function VoicePanel({ stageRef }: { stageRef: RefObject<StageState> }) {
  const conversation = useConversation({
    agentId: AGENT_ID,
    microphone: false,
  });
  const messages = useAgentMessages(conversation.session);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);

  const live =
    conversation.status === "connected" || conversation.status === "reconnecting";
  const micOn = live && !conversation.micMuted;

  const statusLabel = (() => {
    if (conversation.status === "connecting") return "Menyambung";
    if (conversation.status === "reconnecting") return "Menyambung ulang";
    if (conversation.status === "connected") {
      if (conversation.mode === "speaking") return "Berbicara";
      if (conversation.mode === "thinking") return "Berpikir";
      return micOn ? "Mendengarkan" : "Siap menerima pesan";
    }
    return "Siap";
  })();

  const statusTone =
    conversation.status === "connected"
      ? conversation.mode === "speaking"
        ? "speaking"
        : conversation.mode === "thinking"
          ? "thinking"
          : "live"
      : conversation.status === "connecting" || conversation.status === "reconnecting"
        ? "busy"
        : "idle";

  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const session = conversation.session;
      if (session) {
        stageRef.current.level =
          typeof session.getOutputVolume === "function" ? session.getOutputVolume() : 0;
        stageRef.current.speaking =
          session.status === "connected" && session.mode === "speaking";
        stageRef.current.mode = session.mode;
      } else {
        stageRef.current.level = 0;
        stageRef.current.speaking = false;
        stageRef.current.mode = "idle";
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      stageRef.current.level = 0;
      stageRef.current.speaking = false;
      stageRef.current.mode = "idle";
    };
  }, [conversation.session, stageRef]);

  const ensureSession = useCallback(async () => {
    if (conversation.status === "connected" || conversation.status === "reconnecting") {
      return true;
    }
    setError(null);
    setBusy(true);
    try {
      await conversation.startSession({ agentId: AGENT_ID });
      conversation.setOutputVolume(soundOn ? 1 : 0);
      try {
        await conversation.startAudio();
      } catch {
        setNotice("Klik di mana saja untuk mengaktifkan suara Clara.");
        const resume = () => {
          conversation
            .startAudio()
            .then(() => setNotice(null))
            .catch(() => undefined);
        };
        window.addEventListener("pointerdown", resume, { once: true, capture: true });
      }
      return true;
    } catch (err) {
      setError(describeError(err));
      return false;
    } finally {
      setBusy(false);
    }
  }, [conversation, soundOn]);

  const send = useCallback(
    async (value: string) => {
      const text = value.trim();
      if (!text || busy) return;
      const ok = await ensureSession();
      if (!ok) return;
      if (conversation.mode === "speaking") conversation.interrupt();
      conversation.sendUserMessage(text, { audio: soundOn });
      setInput("");
      setNotice(null);
    },
    [busy, conversation, ensureSession, soundOn],
  );

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void send(input);
  };

  const toggleMic = async () => {
    const wasIdle = conversation.status !== "connected";
    const ok = await ensureSession();
    if (!ok) return;
    setError(null);
    try {
      if (wasIdle) {
        await conversation.setMicMuted(false);
      } else {
        await conversation.setMicMuted(!conversation.micMuted);
      }
    } catch (err) {
      setError(describeError(err));
    }
  };

  const toggleSound = async () => {
    const next = !soundOn;
    setSoundOn(next);
    if (!conversation.session) return;
    conversation.setOutputVolume(next ? 1 : 0);
    if (next) {
      try {
        await conversation.startAudio();
      } catch {
        setNotice("Ketuk layar sekali untuk mengaktifkan suara.");
      }
    }
  };

  const end = () => {
    void conversation.endSession();
    setNotice(null);
  };

  const visibleMessages = messages.slice(-8);

  return (
    <div className="voice">
      <div className="voice__top">
        <div className="voice__identity">
          <span className="voice__eye">
            <TvEye />
          </span>
          <span className="voice__who">
            <strong>Clara</strong>
            <small>Asisten suara Sa&apos;rul</small>
          </span>
        </div>
        <span className={`voice__status voice__status--${statusTone}`}>
          <span className="status-dot" />
          {statusLabel}
        </span>
      </div>

      {error && (
        <div className="voice__alert" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Tutup pesan">
            <X size={14} />
          </button>
        </div>
      )}
      {notice && !error && (
        <p className="voice__notice">
          <Sparkles size={14} /> {notice}
        </p>
      )}

      <div className="voice__log" ref={logRef} aria-live="polite">
        {visibleMessages.length === 0 ? (
          <p className="voice__empty">
            Ajukan pertanyaan atau pilih saran di bawah ini. Clara menjawab dengan santun, dan
            kata-katanya akan muncul di sini.
          </p>
        ) : (
          visibleMessages.map((message) => (
            <div
              key={message.key}
              className={`voice__msg voice__msg--${message.role} ${
                message.final ? "" : "is-streaming"
              }`}
            >
              <span>{message.role === "user" ? "Anda" : "Clara"}</span>
              <p>{message.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="voice__chips">
        {suggestions.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => void send(chip)}
            disabled={busy}
          >
            {chip}
          </button>
        ))}
      </div>

      <form className="voice__composer" onSubmit={onSubmit}>
        <button
          type="button"
          className={`voice__icon-btn ${micOn ? "is-on" : ""}`}
          onClick={() => void toggleMic()}
          aria-label={micOn ? "Matikan mikrofon" : "Aktifkan mikrofon"}
          aria-pressed={micOn}
          title={micOn ? "Matikan mikrofon" : "Bicara langsung"}
        >
          {micOn ? <Mic size={17} /> : <MicOff size={17} />}
        </button>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={busy ? "Menyambungkan Clara…" : "Tanyakan apa saja pada Clara…"}
          aria-label="Tulis pertanyaan untuk Clara"
          autoComplete="off"
          maxLength={500}
        />
        {conversation.session && (
          <AgentAudioVisualizer
            session={conversation.session}
            bars={13}
            width={62}
            height={18}
            className="voice__viz"
          />
        )}
        <button
          type="submit"
          className="voice__send"
          disabled={!input.trim() || busy}
          aria-label="Kirim pertanyaan"
        >
          <ArrowUp size={17} />
        </button>
      </form>

      <div className="voice__foot">
        <div className="voice__controls">
          <button
            type="button"
            className="voice__text-btn"
            onClick={() => void toggleSound()}
            aria-pressed={soundOn}
          >
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            {soundOn ? "Suara aktif" : "Suara mati"}
          </button>
          {live && (
            <button type="button" className="voice__text-btn voice__text-btn--danger" onClick={end}>
              <PhoneOff size={14} /> Akhiri
            </button>
          )}
        </div>
        <span className="voice__credit">
          Pengisi suara oleh Fish Audio · Model dibuat dengan Tripo
        </span>
      </div>
      <p className="voice__hint">
        Mengetik dapat dilakukan tanpa mikrofon. Aktifkan mikrofon kapan pun Anda ingin berbicara.
      </p>
    </div>
  );
}
