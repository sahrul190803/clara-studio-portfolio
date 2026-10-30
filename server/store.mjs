import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dbEnabled, getPool } from "./db.mjs";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DATA_DIR = path.join(ROOT, "data");
export const UPLOAD_DIR = path.join(ROOT, "uploads");
const CONTENT_FILE = path.join(DATA_DIR, "content.json");

const DEFAULT_CATEGORIES = ["Desain", "Video", "Administrasi", "Coding"];
const CONTENT_LOCK = 724225;

export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function ensureDirs() {
  if (dbEnabled) return;
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(UPLOAD_DIR, { recursive: true });
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function createProjectId(title, projects) {
  const base = slugify(title) || "proyek";
  let id = base;
  let counter = 2;
  const ids = new Set(projects.map((project) => project.id));
  while (ids.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

export function normalizeContent(input) {
  const categories = [];
  const seen = new Set();
  const sourceCategories = Array.isArray(input?.categories) ? input.categories : DEFAULT_CATEGORIES;
  for (const raw of sourceCategories) {
    const name = cleanString(raw);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    categories.push(name);
  }
  if (categories.length === 0) categories.push(...DEFAULT_CATEGORIES);

  const projects = (Array.isArray(input?.projects) ? input.projects : []).map((project) => ({
    id: cleanString(project?.id),
    title: cleanString(project?.title),
    category: cleanString(project?.category),
    year: cleanString(project?.year),
    cover: cleanString(project?.cover),
    summary: cleanString(project?.summary),
    description: cleanString(project?.description),
    role: cleanString(project?.role),
    goals: cleanArray(project?.goals),
    process: cleanArray(project?.process),
    tools: cleanArray(project?.tools),
    result: cleanString(project?.result),
    featured: Boolean(project?.featured),
  }));

  return {
    categories,
    projects,
    updatedAt: cleanString(input?.updatedAt) || new Date().toISOString(),
  };
}

export function validateProject(input, categories, existing, projects) {
  const title = cleanString(input?.title);
  if (!title) throw new HttpError(400, "Judul proyek wajib diisi.");

  const category = cleanString(input?.category);
  if (!category) throw new HttpError(400, "Kategori proyek wajib dipilih.");
  if (!categories.includes(category)) {
    throw new HttpError(400, `Kategori "${category}" tidak tersedia.`);
  }

  const cover = cleanString(input?.cover);
  if (!cover) throw new HttpError(400, "Thumbnail proyek wajib diisi.");

  const project = {
    id: existing?.id ?? createProjectId(title, projects),
    title,
    category,
    year: cleanString(input?.year) || String(new Date().getFullYear()),
    cover,
    summary: cleanString(input?.summary),
    description: cleanString(input?.description),
    role: cleanString(input?.role),
    goals: cleanArray(input?.goals),
    process: cleanArray(input?.process),
    tools: cleanArray(input?.tools),
    result: cleanString(input?.result),
    featured: Boolean(input?.featured),
  };

  return project;
}

function defaultContent() {
  return normalizeContent({
    categories: DEFAULT_CATEGORIES,
    projects: [],
    updatedAt: new Date().toISOString(),
  });
}

async function readContentFromDb() {
  const { rows } = await getPool().query("SELECT data FROM app_content WHERE id = 1");
  if (rows.length === 0) return writeContent(defaultContent());
  return normalizeContent(rows[0].data);
}

async function readContentFromFile() {
  try {
    const raw = await readFile(CONTENT_FILE, "utf8");
    return normalizeContent(JSON.parse(raw));
  } catch (error) {
    if (error?.code === "ENOENT") {
      const content = defaultContent();
      await writeContent(content);
      return content;
    }
    throw error;
  }
}

export async function readContent() {
  return dbEnabled ? readContentFromDb() : readContentFromFile();
}

async function writeContentToDb(content) {
  const normalized = normalizeContent(content);
  normalized.updatedAt = new Date().toISOString();
  await getPool().query(
    `INSERT INTO app_content (id, data, updated_at) VALUES (1, $1::jsonb, now())
     ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
    [JSON.stringify(normalized)],
  );
  return normalized;
}

async function writeContentToFile(content) {
  const normalized = normalizeContent(content);
  normalized.updatedAt = new Date().toISOString();
  await mkdir(DATA_DIR, { recursive: true });
  const temporary = `${CONTENT_FILE}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await writeFile(temporary, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  await rename(temporary, CONTENT_FILE);
  return normalized;
}

export async function writeContent(content) {
  return dbEnabled ? writeContentToDb(content) : writeContentToFile(content);
}

let queue = Promise.resolve();

function mutateContentInDb(mutator) {
  const run = (async () => {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock($1)", [CONTENT_LOCK]);
      const { rows } = await client.query("SELECT data FROM app_content WHERE id = 1");
      const content = rows.length ? normalizeContent(rows[0].data) : defaultContent();
      const next = await mutator(content);
      const normalized = normalizeContent(next);
      normalized.updatedAt = new Date().toISOString();
      await client.query(
        `INSERT INTO app_content (id, data, updated_at) VALUES (1, $1::jsonb, now())
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()`,
        [JSON.stringify(normalized)],
      );
      await client.query("COMMIT");
      return normalized;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  })();
  return run;
}

export function mutateContent(mutator) {
  if (dbEnabled) return mutateContentInDb(mutator);
  const run = queue.then(async () => {
    const content = await readContent();
    const next = await mutator(content);
    return writeContent(next);
  });
  queue = run.catch(() => undefined);
  return run;
}

const MIME_BY_EXTENSION = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function saveUpload(name, mime, data) {
  if (!/^[A-Za-z0-9._-]+$/.test(name)) {
    throw new HttpError(400, "Nama file tidak valid.");
  }
  if (dbEnabled) {
    await getPool().query(
      `INSERT INTO app_uploads (name, mime, size, data) VALUES ($1, $2, $3, $4)
       ON CONFLICT (name) DO UPDATE SET mime = EXCLUDED.mime, size = EXCLUDED.size, data = EXCLUDED.data`,
      [name, mime, data.length, data],
    );
    return;
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, name), data);
}

export async function readUpload(name) {
  if (!/^[A-Za-z0-9._-]+$/.test(name)) return null;
  if (dbEnabled) {
    const { rows } = await getPool().query(
      "SELECT mime, data FROM app_uploads WHERE name = $1",
      [name],
    );
    if (rows.length === 0) return null;
    return { mime: rows[0].mime, data: rows[0].data };
  }
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    const extension = path.extname(name).toLowerCase();
    return { mime: MIME_BY_EXTENSION[extension] || "application/octet-stream", data };
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}
