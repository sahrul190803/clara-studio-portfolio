import express from "express";
import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import {
  HttpError,
  ROOT,
  UPLOAD_DIR,
  ensureDirs,
  readContent,
  mutateContent,
  readUpload,
  saveUpload,
  validateProject,
} from "./store.mjs";
import { dbEnabled } from "./db.mjs";
import {
  clearSessionCookie,
  getAdminConfig,
  isAuthenticated,
  setSessionCookie,
  setupPassword,
  verifyPassword,
} from "./auth.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(ROOT, "out");
const portArgument = process.argv.indexOf("--port");
const PORT =
  Number(process.env.PORT) ||
  (portArgument > -1 ? Number(process.argv[portArgument + 1]) : 5173);
const HOST = process.env.HOST || "0.0.0.0";

await ensureDirs();

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "1" || process.env.VERCEL) app.set("trust proxy", 1);
app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  if (req.path.startsWith("/api/")) res.setHeader("Cache-Control", "no-store");
  next();
});

const wrap =
  (handler) =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);

const loginAttempts = new Map();
const LOGIN_WINDOW = 10 * 60 * 1000;
const LOGIN_LIMIT = 8;

function attemptKey(req) {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function isLoginBlocked(key) {
  const attempt = loginAttempts.get(key);
  if (!attempt) return false;
  if (Date.now() > attempt.resetAt) {
    loginAttempts.delete(key);
    return false;
  }
  return attempt.count >= LOGIN_LIMIT;
}

function recordLoginFailure(key) {
  const current = loginAttempts.get(key);
  if (!current || Date.now() > current.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + LOGIN_WINDOW });
    return;
  }
  current.count += 1;
}

function clearLoginFailures(key) {
  loginAttempts.delete(key);
}

const requireAuth = wrap(async (req, res, next) => {
  const config = await getAdminConfig();
  if (!config) throw new HttpError(409, "Admin belum dikonfigurasi.");
  if (!isAuthenticated(req, config.secret)) {
    throw new HttpError(401, "Sesi berakhir. Silakan masuk kembali.");
  }
  next();
});

function uploadExtension(mimetype) {
  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return extensions[mimetype] || ".img";
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (dbEnabled ? 4 : 8) * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype === "image/svg+xml") {
      callback(new HttpError(400, "Format SVG tidak diizinkan. Gunakan JPG, PNG, atau WebP."));
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.mimetype)) {
      callback(new HttpError(400, "File harus berupa gambar JPG, PNG, WebP, GIF, atau AVIF."));
      return;
    }
    callback(null, true);
  },
});

function categoryName(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

/* ------------------------------ public API ------------------------------ */

app.get(
  "/api/health",
  wrap(async (req, res) => {
    res.json({ ok: true });
  }),
);

app.get(
  "/api/content",
  wrap(async (req, res) => {
    const content = await readContent();
    res.json({
      projects: content.projects,
      categories: content.categories,
      updatedAt: content.updatedAt,
    });
  }),
);

/* -------------------------------- auth --------------------------------- */

app.get(
  "/api/admin/status",
  wrap(async (req, res) => {
    const config = await getAdminConfig();
    res.json({
      configured: Boolean(config),
      authenticated: config ? isAuthenticated(req, config.secret) : false,
    });
  }),
);

app.get(
  "/api/admin/session",
  wrap(async (req, res) => {
    const config = await getAdminConfig();
    res.json({
      authenticated: Boolean(config && isAuthenticated(req, config.secret)),
    });
  }),
);

app.post(
  "/api/admin/setup",
  wrap(async (req, res) => {
    const password = req.body?.password;
    await setupPassword(password);
    const config = await getAdminConfig();
    setSessionCookie(res, config.secret);
    res.status(201).json({ ok: true });
  }),
);

app.post(
  "/api/admin/login",
  wrap(async (req, res) => {
    const config = await getAdminConfig();
    if (!config) throw new HttpError(409, "Admin belum dikonfigurasi.");
    const key = attemptKey(req);
    if (isLoginBlocked(key)) {
      throw new HttpError(429, "Terlalu banyak percobaan. Coba lagi dalam 10 menit.");
    }
    const password = req.body?.password;
    const valid = await verifyPassword(password);
    if (!valid) {
      recordLoginFailure(key);
      throw new HttpError(401, "Kata sandi salah.");
    }
    clearLoginFailures(key);
    setSessionCookie(res, config.secret);
    res.json({ ok: true });
  }),
);

app.post("/api/admin/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

/* ------------------------------- content ------------------------------- */

app.get(
  "/api/admin/content",
  requireAuth,
  wrap(async (req, res) => {
    const content = await readContent();
    res.json(content);
  }),
);

app.get(
  "/api/admin/export",
  requireAuth,
  wrap(async (req, res) => {
    const content = await readContent();
    res.setHeader("Content-Disposition", 'attachment; filename="portfolio-content.json"');
    res.json(content);
  }),
);

app.post(
  "/api/admin/projects",
  requireAuth,
  wrap(async (req, res) => {
    const content = await readContent();
    const project = validateProject(req.body, content.categories, null, content.projects);
    const updated = await mutateContent((current) => {
      current.projects.unshift(project);
      return current;
    });
    res.status(201).json({ project, content: updated });
  }),
);

app.put(
  "/api/admin/projects/:id",
  requireAuth,
  wrap(async (req, res) => {
    const content = await readContent();
    const existing = content.projects.find((project) => project.id === req.params.id);
    if (!existing) throw new HttpError(404, "Proyek tidak ditemukan.");
    const project = validateProject(
      req.body,
      content.categories,
      existing,
      content.projects,
    );
    const updated = await mutateContent((current) => {
      const index = current.projects.findIndex((item) => item.id === existing.id);
      if (index === -1) throw new HttpError(404, "Proyek tidak ditemukan.");
      current.projects[index] = project;
      return current;
    });
    res.json({ project, content: updated });
  }),
);

app.delete(
  "/api/admin/projects/:id",
  requireAuth,
  wrap(async (req, res) => {
    await mutateContent((current) => {
      const index = current.projects.findIndex((item) => item.id === req.params.id);
      if (index === -1) throw new HttpError(404, "Proyek tidak ditemukan.");
      current.projects.splice(index, 1);
      return current;
    });
    res.status(204).end();
  }),
);

app.put(
  "/api/admin/reorder",
  requireAuth,
  wrap(async (req, res) => {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : null;
    if (!ids) throw new HttpError(400, "Urutan proyek tidak valid.");
    const updated = await mutateContent((current) => {
      const byId = new Map(current.projects.map((project) => [project.id, project]));
      const ordered = [];
      for (const id of ids) {
        const project = byId.get(id);
        if (project) {
          ordered.push(project);
          byId.delete(id);
        }
      }
      for (const project of current.projects) {
        if (byId.has(project.id)) ordered.push(project);
      }
      current.projects = ordered;
      return current;
    });
    res.json(updated);
  }),
);

/* ------------------------------ categories ------------------------------ */

app.post(
  "/api/admin/categories",
  requireAuth,
  wrap(async (req, res) => {
    const name = categoryName(req.body?.name);
    if (!name) throw new HttpError(400, "Nama kategori wajib diisi.");
    if (name.length < 2) throw new HttpError(400, "Nama kategori minimal 2 karakter.");
    const content = await readContent();
    if (content.categories.some((category) => category.toLowerCase() === name.toLowerCase())) {
      throw new HttpError(409, `Kategori "${name}" sudah ada.`);
    }
    const updated = await mutateContent((current) => {
      current.categories.push(name);
      return current;
    });
    res.status(201).json(updated);
  }),
);

app.put(
  "/api/admin/categories/:name",
  requireAuth,
  wrap(async (req, res) => {
    const oldName = decodeURIComponent(req.params.name);
    const newName = categoryName(req.body?.name);
    if (!newName) throw new HttpError(400, "Nama kategori wajib diisi.");
    if (newName.length < 2) throw new HttpError(400, "Nama kategori minimal 2 karakter.");
    const content = await readContent();
    const category = content.categories.find(
      (item) => item.toLowerCase() === oldName.toLowerCase(),
    );
    if (!category) throw new HttpError(404, "Kategori tidak ditemukan.");
    if (
      content.categories.some(
        (item) => item !== category && item.toLowerCase() === newName.toLowerCase(),
      )
    ) {
      throw new HttpError(409, `Kategori "${newName}" sudah ada.`);
    }
    if (category === newName) {
      res.json(content);
      return;
    }
    const updated = await mutateContent((current) => {
      current.categories = current.categories.map((item) =>
        item === category ? newName : item,
      );
      current.projects = current.projects.map((project) =>
        project.category === category ? { ...project, category: newName } : project,
      );
      return current;
    });
    res.json(updated);
  }),
);

app.delete(
  "/api/admin/categories/:name",
  requireAuth,
  wrap(async (req, res) => {
    const name = decodeURIComponent(req.params.name);
    const force = req.query.force === "1";
    const content = await readContent();
    const category = content.categories.find(
      (item) => item.toLowerCase() === name.toLowerCase(),
    );
    if (!category) throw new HttpError(404, "Kategori tidak ditemukan.");
    if (content.categories.length <= 1) {
      throw new HttpError(409, "Minimal harus ada satu kategori.");
    }
    const affected = content.projects.filter((project) => project.category === category);
    if (affected.length > 0 && !force) {
      throw new HttpError(
        409,
        `${affected.length} proyek masih memakai kategori "${category}". Pindahkan ke "Lainnya" untuk melanjutkan.`,
        { projectCount: affected.length },
      );
    }
    const fallback = category.toLowerCase() === "lainnya" ? "Umum" : "Lainnya";
    const updated = await mutateContent((current) => {
      if (affected.length > 0) {
        if (!current.categories.some((item) => item.toLowerCase() === fallback.toLowerCase())) {
          current.categories.push(fallback);
        }
        current.projects = current.projects.map((project) =>
          project.category === category ? { ...project, category: fallback } : project,
        );
      }
      current.categories = current.categories.filter((item) => item !== category);
      return current;
    });
    res.json(updated);
  }),
);

/* -------------------------------- upload ------------------------------- */

app.post("/api/admin/upload", requireAuth, (req, res, next) => {
  upload.single("file")(req, res, async (error) => {
    try {
      if (error) {
        const status = error.status || (error instanceof multer.MulterError ? 400 : 500);
        const message =
          error.code === "LIMIT_FILE_SIZE"
            ? `Ukuran gambar maksimal ${dbEnabled ? 4 : 8} MB.`
            : error.message || "Upload gagal.";
        res.status(status).json({ error: message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "Pilih file gambar terlebih dahulu." });
        return;
      }
      const filename = `${Date.now()}-${crypto.randomBytes(5).toString("hex")}${uploadExtension(
        req.file.mimetype,
      )}`;
      await saveUpload(filename, req.file.mimetype, req.file.buffer);
      res.status(201).json({
        url: dbEnabled ? `/api/uploads/${filename}` : `/uploads/${filename}`,
        name: req.file.originalname,
        size: req.file.size,
      });
    } catch (saveError) {
      next(saveError);
    }
  });
});

app.get(
  "/api/uploads/:name",
  wrap(async (req, res) => {
    const file = await readUpload(req.params.name);
    if (!file) throw new HttpError(404, "File tidak ditemukan.");
    res.setHeader("Content-Type", file.mime);
    res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    res.send(file.data);
  }),
);

/* -------------------------------- static ------------------------------- */

app.use("/uploads", express.static(UPLOAD_DIR, { maxAge: "7d", fallthrough: true }));

const sendIndex = (req, res) =>
  res.sendFile(path.join(OUT_DIR, "index.html"), {
    headers: { "Cache-Control": "no-store" },
  });

app.get(["/", "/index.html", "/admin", "/admin/"], sendIndex);

app.use(
  express.static(OUT_DIR, {
    index: false,
    maxAge: "1h",
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-store");
    },
  }),
);

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
    next();
    return;
  }
  if (path.extname(req.path)) {
    next();
    return;
  }
  sendIndex(req, res);
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "Endpoint tidak ditemukan." });
    return;
  }
  if (path.extname(req.path)) {
    res.status(404).type("text/plain").send("Not found");
    return;
  }
  res.status(404).sendFile(path.join(OUT_DIR, "404.html"));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }
  const status = error.status || (error instanceof multer.MulterError ? 400 : 500);
  if (status >= 500) console.error(error);
  if (req.path.startsWith("/api/")) {
    res.status(status).json({
      error: error.message || "Terjadi kesalahan pada server.",
      ...(error.details ?? {}),
    });
    return;
  }
  res.status(status).type("text/plain").send(error.message || "Terjadi kesalahan pada server.");
});

if (!fs.existsSync(path.join(OUT_DIR, "index.html")) && !process.env.VERCEL) {
  console.warn("Folder out/index.html belum ada. Jalankan `npm run build` terlebih dahulu.");
}

if (!process.env.VERCEL) {
  const server = app.listen(PORT, HOST, async () => {
    const config = await getAdminConfig();
    console.log(`Portfolio: http://localhost:${PORT}`);
    console.log(`Admin    : http://localhost:${PORT}/admin`);
    console.log(config ? "Admin sudah dikonfigurasi." : "Admin belum dikonfigurasi — buat kata sandi saat pertama membuka /admin.");
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(`Port ${PORT} sedang dipakai. Hentikan proses lain atau jalankan dengan PORT lain.`);
      process.exit(1);
    }
    throw error;
  });
}

export default app;
