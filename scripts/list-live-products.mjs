import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const c = new pg.Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING.split("?")[0],
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const res = await c.query(
  "SELECT id, title, type, price, status FROM digital_products WHERE status = 'published' ORDER BY created_at DESC"
);
console.log(`\n=== ALL ${res.rows.length} PUBLISHED PRODUCTS IN STORE ===`);
console.table(res.rows.map((r) => ({
  title: r.title.length > 50 ? r.title.slice(0, 47) + "..." : r.title,
  type: r.type,
  price: Number(r.price) === 0 ? "₦0.00 (Free)" : `₦${Number(r.price).toLocaleString()}`,
  status: r.status,
})));
await c.end();
