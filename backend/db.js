<<<<<<< HEAD
require("dotenv").config();
const { Pool } = require("pg");
const dns = require("dns");

// Paksa prioritaskan IPv6
dns.setDefaultResultOrder("ipv6first");

let pool;

function connectDatabase(mode) {
  if (mode === "supabase") {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      keepAlive: true,
      connectionTimeoutMillis: 10000,
    });
    console.log("🌐 Menggunakan database Supabase");
  } else {
    pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });
    console.log("💻 Menggunakan database lokal");
  }

  pool
    .connect()
    .then(() => console.log("✅ Terhubung ke PostgreSQL"))
    .catch((err) => console.error("❌ Gagal koneksi DB:", err.message));
}

module.exports = { connectDatabase };
=======
const { Pool } = require("pg");

let pool;

function connectDatabase(mode = "local") {
  const isSupabase = mode === "supabase";

  const config = isSupabase
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          require: true,
          rejectUnauthorized: false, // ⚠️ Supabase butuh SSL tanpa sertifikat lokal
        },
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
      // Tambahkan sedikit delay biar tidak spam koneksi
      setTimeout(() => connectDatabase(mode), 5000);
    });

  // Optional: log error runtime (misalnya koneksi tiba-tiba mati)
  pool.on("error", (err) => {
    console.error("⚠️ Error koneksi database:", err.message);
  });
}

function getPool() {
  if (!pool) throw new Error("Database belum dikonfigurasi!");
  return pool;
}

module.exports = { connectDatabase, getPool };
>>>>>>> 5febf52f4296278d5750e56db24e46589332dccc
