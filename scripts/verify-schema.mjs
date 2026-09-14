import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const c = new pg.Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING.split("?")[0],
  ssl: { rejectUnauthorized: false },
});

await c.connect();

const tables = await c.query(
  "select tablename from pg_tables where schemaname = 'public' order by tablename"
);
console.log("TABLES:");
console.log(tables.rows.map((r) => r.tablename).join(", "));

const rls = await c.query(
  `select c.relname as table_name
     from pg_class c
     join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relrowsecurity`
);
console.log(`\nRLS ENABLED ON ${rls.rows.length} TABLES:`);
console.log(rls.rows.map((r) => r.table_name).join(", "));

const policies = await c.query(
  `select tablename, count(*)::int as n from pg_policies where schemaname = 'public' group by tablename order by tablename`
);
console.log("\nPOLICY COUNTS PER TABLE:");
for (const row of policies.rows) console.log(`  ${row.tablename}: ${row.n}`);

await c.end();