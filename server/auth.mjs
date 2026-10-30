import path from "node:path";
import crypto from "node:crypto";
import { readFile, rename, writeFile, mkdir } from "node:fs/promises";
import { DATA_DIR, HttpError } from "./store.mjs";
import { dbEnabled, getPool } from "./db.mjs";

const CONFIG_FILE = path.join(DATA_DIR, "admin.json");
const COOKIE_NAME = "si_admin_session";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

function scrypt(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) reject(error);
      else resolve(key.toString("hex"));
    });
  });
}

async function readConfig() {
  if (dbEnabled) {
    const { rows } = await getPool().query(
      "SELECT salt, hash, secret, created_at FROM app_admin WHERE id = 1",
    );
    if (rows.length === 0) return null;
    return {
      salt: rows[0].salt,
      hash: rows[0].hash,
      secret: rows[0].secret,
      createdAt: rows[0].created_at?.toISOString?.() ?? String(rows[0].created_at),
    };
  }
  try {
    return JSON.parse(await readFile(CONFIG_FILE, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function writeConfig(config) {
  if (dbEnabled) {
    const result = await getPool().query(
      `INSERT INTO app_admin (id, salt, hash, secret, created_at) VALUES (1, $1, $2, $3, now())
       ON CONFLICT (id) DO NOTHING`,
      [config.salt, config.hash, config.secret],
    );
    if (result.rowCount === 0) throw new HttpError(409, "Akun admin sudah dikonfigurasi.");
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  const temporary = `${CONFIG_FILE}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await writeFile(temporary, `${JSON.stringify(config, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  await rename(temporary, CONFIG_FILE);
}

export async function getAdminConfig() {
  return readConfig();
}

export async function isConfigured() {
  return Boolean(await readConfig());
}

export async function setupPassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new HttpError(400, "Kata sandi minimal 8 karakter.");
  }
  if (password.length > 200) {
    throw new HttpError(400, "Kata sandi terlalu panjang.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt);
  const config = {
    salt,
    hash,
    secret: crypto.randomBytes(32).toString("hex"),
    createdAt: new Date().toISOString(),
  };
  await writeConfig(config);
  return config;
}

export async function verifyPassword(password) {
  const config = await readConfig();
  if (!config) return false;
  if (typeof password !== "string" || password.length === 0) return false;
  const candidate = await scrypt(password, config.salt);
  const expected = Buffer.from(config.hash, "hex");
  const actual = Buffer.from(candidate, "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSession(secret) {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_MS, iat: Date.now() }),
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySession(token, secret) {
  if (typeof token !== "string") return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload, secret);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

function cookies(req) {
  const header = req.headers?.cookie;
  if (!header) return {};
  return header.split(";").reduce((acc, part) => {
    const index = part.indexOf("=");
    if (index === -1) return acc;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (key) {
      try {
        acc[key] = decodeURIComponent(value);
      } catch {
        acc[key] = value;
      }
    }
    return acc;
  }, {});
}

export function isAuthenticated(req, secret) {
  const token = cookies(req)[COOKIE_NAME];
  return Boolean(token && secret && verifySession(token, secret));
}

export function setSessionCookie(res, secret) {
  res.cookie(COOKIE_NAME, createSession(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "1",
    path: "/",
    maxAge: SESSION_MS,
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}
