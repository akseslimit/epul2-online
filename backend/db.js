const { Pool } = require("pg");

let pool;

function connectDatabase(mode = "local") {
  const isSupabase = mode === "supabase";

  const config = isSupabase
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false, // ⚠️ WAJIB untuk Supabase / Railway
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
    });
}

function getPool() {
  if (!pool) throw new Error("Database belum dikonfigurasi!");
  return pool;
}

module.exports = { connectDatabase, getPool };
