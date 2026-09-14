import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Client } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationsDir = join(__dirname, "..", "supabase", "migrations");

const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) {
  console.error(
    "POSTGRES_URL_NON_POOLING is not set. Add it to .env.local (Supabase dashboard -> Project Settings -> Database)."
  );
  process.exit(1);
}

const client = new Client({
  connectionString: connectionString.split("?")[0],
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();

  await client.query(
    "create table if not exists public.schema_migrations (" +
      "name text primary key, applied_at timestamptz not null default now())"
  );

  const applied = await client.query(
    "select name from public.schema_migrations"
  );
  const appliedSet = new Set(applied.rows.map((r) => r.name));

  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) {
      console.log(`skip:     ${file}`);
      continue;
    }
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into public.schema_migrations (name) values ($1)", [file]);
      await client.query("commit");
      console.log(`applied:  ${file}`);
    } catch (err) {
      await client.query("rollback");
      console.error(`FAILED:   ${file} -> ${err.message}`);
      process.exitCode = 1;
      break;
    }
  }

  if (process.exitCode !== 1) console.log("All migrations applied.");
} finally {
  await client.end();
}