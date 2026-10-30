import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { About } from "./components/About";
import { Awards } from "./components/Awards";
import { Clients } from "./components/Clients";
import { Contact } from "./components/Contact";
import { CTABanner } from "./components/CTABanner";
import { CustomCursor } from "./components/CustomCursor";
import { FAQ } from "./components/FAQ";
import { FloatingActions } from "./components/FloatingActions";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { LoadingScreen } from "./components/LoadingScreen";
import { Navbar } from "./components/Navbar";
import { NotFound } from "./components/NotFound";
import { Pricing } from "./components/Pricing";
import { Projects } from "./components/Projects";
import { ScrollProgress } from "./components/ScrollProgress";
import { Services } from "./components/Services";
import { Skills } from "./components/Skills";
import { Stats } from "./components/Stats";
import { Testimonials } from "./components/Testimonials";
import { Timeline } from "./components/Timeline";
import { ContentProvider } from "./content/ContentProvider";
import type { StageState } from "./stage";

const AdminApp = lazy(() => import("./admin/AdminApp"));

export default function App() {
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isRoot = pathname === "/" || pathname.endsWith("/index.html");

  const [theme, setTheme] = useState<"dark" | "light">(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  );
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const stageRef = useRef<StageState>({ level: 0, speaking: false, mode: "idle" });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("si-theme", theme);
    } catch {
      /* ignore storage failures */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#121211" : "#f2eee6");
  }, [theme]);

  useEffect(() => {
    if (isRoot || isAdmin) return;
    document.title = "404 — Halaman tidak ditemukan · Sa'rul Ibad";
  }, [isAdmin, isRoot]);

  useEffect(() => {
    if (ready) return;
    const fallback = window.setTimeout(() => setReady(true), 15000);
    return () => window.clearTimeout(fallback);
  }, [ready]);

  const handleProgress = useCallback((value: number) => {
    setProgress((previous) => Math.max(previous, value));
  }, []);

  const handleReady = useCallback(() => {
    setProgress(100);
    setReady(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  if (isAdmin) {
    return (
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100svh",
              display: "grid",
              placeItems: "center",
              background: "var(--bg)",
              color: "var(--ink-3)",
              fontFamily: "var(--font-ui)",
              fontSize: 12,
            }}
          >
            Memuat dashboard…
          </div>
        }
      >
        <AdminApp theme={theme} onToggleTheme={toggleTheme} />
      </Suspense>
    );
  }

  if (!isRoot) {
    return (
      <>
        <CustomCursor />
        <NotFound />
      </>
    );
  }

  return (
    <ContentProvider>
      <a className="skip-link" href="#main">
        Lewati ke konten utama
      </a>
      <CustomCursor />
      <ScrollProgress />
      <LoadingScreen progress={progress} ready={ready} />
      <Navbar theme={theme} onToggleTheme={toggleTheme} />

      <main id="main">
        <Hero
          stageRef={stageRef}
          onProgress={handleProgress}
          onReady={handleReady}
        />
        <Stats />
        <About />
        <Skills />
        <Projects />
        <Services />
        <Pricing />
        <Timeline />
        <Awards />
        <Testimonials />
        <Clients />
        <FAQ />
        <CTABanner />
        <Contact />
      </main>

      <Footer />
      <FloatingActions />
    </ContentProvider>
  );
}
