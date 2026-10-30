import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dbEnabled, getPool } from "../server/db.mjs";
import { normalizeContent } from "../server/store.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

if (!dbEnabled) {
  console.error("DATABASE_URL belum diset.");
  process.exit(1);
}

const raw = await readFile(path.join(ROOT, "data", "content.json"), "utf8");
const content = normalizeContent(JSON.parse(raw));

const pool = getPool();
const existing = await pool.query("SELECT 1 FROM app_content WHERE id = 1");
if (existing.rowCount > 0) {
  console.log("Database sudah memiliki konten, seed dilewati.");
} else {
  await pool.query(
    "INSERT INTO app_content (id, data, updated_at) VALUES (1, $1::jsonb, now())",
    [JSON.stringify(content)],
  );
  console.log(`Seed selesai: ${content.projects.length} proyek, ${content.categories.length} kategori.`);
}
await pool.end();
