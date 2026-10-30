import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  categories as seedCategories,
  projects as seedProjects,
  type Project,
} from "../data/portfolio";

interface ContentState {
  projects: Project[];
  categories: string[];
  loading: boolean;
  source: "api" | "seed";
}

const ContentContext = createContext<ContentState>({
  projects: seedProjects,
  categories: seedCategories,
  loading: true,
  source: "seed",
});

export function ContentProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(seedProjects);
  const [categories, setCategories] = useState<string[]>(seedCategories);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "seed">("seed");

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    fetch("/api/content", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{
          projects?: Project[];
          categories?: string[];
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
        if (Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
        setSource("api");
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setSource("seed");
        setLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const value = useMemo<ContentState>(
    () => ({ projects, categories, loading, source }),
    [projects, categories, loading, source],
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
