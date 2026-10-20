import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Client } = pg;
const client = new Client({
  connectionString: process.env.POSTGRES_URL_NON_POOLING.split("?")[0],
  ssl: { rejectUnauthorized: false },
});

await client.connect();

await client.query(`
  insert into public.store_settings (
    id,
    company_bank_name,
    company_account_name,
    company_account_number,
    whatsapp_number,
    whatsapp_instructions,
    updated_at
  ) values (
    'default',
    'Guaranty Trust Bank',
    'Tintol Business Services',
    '0029103844',
    '2348034710699',
    'Transfer the exact amount to Tintol Business Services (GTBank 0029103844) and click the button to send your receipt on WhatsApp for instant confirmation.',
    now()
  ) on conflict (id) do update set
    company_bank_name = excluded.company_bank_name,
    company_account_name = excluded.company_account_name,
    company_account_number = excluded.company_account_number,
    whatsapp_number = excluded.whatsapp_number,
    whatsapp_instructions = excluded.whatsapp_instructions,
    updated_at = now();
`);

console.log("SUCCESS: Store settings updated with GTBank and Tintol Business Services!");
await client.end();
