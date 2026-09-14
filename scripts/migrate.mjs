import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = readFileSync(
  join(__dirname, "..", "supabase", "migrations", "0001_init.sql"),
  "utf8"
);

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error(
    "POSTGRES_URL_NON_POOLING is not set. Add it to .env.local (Dev settings -> Connection string in Supabase dashboard)."
  );
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString.split("?")[0],
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Migration 0001_init applied successfully.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}