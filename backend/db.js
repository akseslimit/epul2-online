// ================== Paksa koneksi pakai IPv4 (bukan IPv6) ==================
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
const { lookup } = require("dns").promises;
require("dotenv").config();
const { Pool } = require("pg");

let pool;

async function connectDatabase(mode = "local") {
  const isSupabase = mode === "supabase";

  // ✅ Resolve manual IPv4 untuk Supabase Pooler
  if (isSupabase && process.env.DATABASE_URL.includes("supabase.com")) {
    try {
      const addr = await lookup("aws-1-ap-southeast-1.pooler.supabase.com", { family: 4 });
      console.log("✅ Supabase IPv4 resolved:", addr.address);
      process.env.DATABASE_URL = process.env.DATABASE_URL.replace(
        "aws-1-ap-southeast-1.pooler.supabase.com",
        addr.address
      );
    } catch (err) {
      console.warn("⚠️ Gagal resolve IPv4 Supabase:", err.message);
    }
  }

  // ✅ Konfigurasi koneksi database
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

  pool = new Pool(config);

  // ✅ Coba koneksi ke database
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

  // ✅ Tangani error runtime
  pool.on("error", (err) => {
    console.error("⚠️ Error koneksi database:", err.message);
  });
}

// ✅ Getter Pool (akses dari file lain)
function getPool() {
  if (!pool) throw new Error("Database belum dikonfigurasi!");
  return pool;
}

module.exports = { connectDatabase, getPool };
