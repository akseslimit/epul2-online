const pool = require("../db");   // sesuaikan dengan lokasi db.js
const bcrypt = require("bcrypt");

(async () => {
  try {
    const name = "Super Admin";
    const email = "admin@example.com";
    const plainPassword = "admin123";   // password login
    const role = "admin";

    // hash password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // simpan ke database
    const result = await pool.query(
      `INSERT INTO users (id, name, email, password, role, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, role]
    );

    console.log("✅ User admin berhasil dibuat:", result.rows[0]);
    console.log("👉 Login pakai:");
    console.log("Email:", email);
    console.log("Password:", plainPassword);

    process.exit(0);
  } catch (err) {
    console.error("🔥 Gagal buat user:", err.message);
    process.exit(1);
  }
})();
