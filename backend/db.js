// ================== FIX: Paksa Node pakai IPv6 dulu ==================
process.env.NODE_OPTIONS = "--dns-result-order=ipv6first";
const dns = require("dns");
dns.setDefaultResultOrder("ipv6first");

require("dotenv").config();
const { Pool } = require("pg");

let pool;

function connectDatabase(mode = "local") {
  const isSupabase = mode === "supabase";

  const config = isSupabase
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          require: true,
          rejectUnauthorized: false, // ⚠️ wajib untuk Supabase / Railway
        },
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

  pool = new Pool(config);

  pool
    .connect()
    .then(() => {
      console.log(`✅ Terhubung ke database (${isSupabase ? "Supabase" : "Lokal"})`);
    })
    .catch((err) => {
      console.error("❌ Gagal koneksi DB:", err.message);
      console.log("⏳ Mencoba ulang koneksi dalam 5 detik...");
      setTimeout(() => connectDatabase(mode), 5000);
    });

  // ✅ Tangani error runtime (misal koneksi terputus)
  pool.on("error", (err) => {
    console.error("⚠️ Error koneksi database:", err.message);
  });
}

function getPool() {
  if (!pool) throw new Error("Database belum dikonfigurasi!");
  return pool;
}

module.exports = { connectDatabase, getPool };
