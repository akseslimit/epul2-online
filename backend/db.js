// di atas Pool config
const { lookup } = require("dns").promises;

async function connectDatabase(mode = "local") {
  const isSupabase = mode === "supabase";

  // paksa resolusi IPv4 Supabase
  if (isSupabase && process.env.DATABASE_URL.includes("supabase.co")) {
    try {
      const addr = await lookup("db.pnohynmtrgcmtuecsymt.supabase.co", { family: 4 });
      console.log("✅ Supabase IPv4 address:", addr.address);
    } catch (e) {
      console.warn("⚠️ Gagal resolve IPv4 Supabase:", e.message);
    }
  }

  const config = isSupabase
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { require: true, rejectUnauthorized: false },
        keepAlive: true,
        connectionTimeoutMillis: 10000,
      }
    : {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASS || "password",
        database: process.env.DB_NAME || "db_lokal",
      };

  const pool = new Pool(config);
  ...
}
