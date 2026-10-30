import pg from "pg";

const connectionString = process.env.DATABASE_URL || "";

export const dbEnabled = Boolean(connectionString);

let pool = null;

export function getPool() {
  if (!pool) {
    const needsSsl =
      /sslmode=require/i.test(connectionString) || /neon\.tech/i.test(connectionString);
    pool = new pg.Pool({
      connectionString,
      max: 3,
      ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    });
  }
  return pool;
}
