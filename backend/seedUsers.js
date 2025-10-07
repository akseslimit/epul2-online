const bcrypt = require("bcrypt");
const pool = require("./db");

async function seedUsers() {
  const users = [
    { name: "Admin User", email: "admin@example.com", role: "admin", area: "Jakarta Pusat" },
    { name: "Sales User", email: "sales@example.com", role: "sales", area: "Jakarta Utara" },
    { name: "Outlet User", email: "outlet@example.com", role: "outlet", area: "Bandung" },
    { name: "Warehouse User", email: "gudang@example.com", role: "gudang", area: "Surabaya" }
  ];

  try {
    // Kosongkan tabel users dulu
    await pool.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

    for (const u of users) {
      const hashedPassword = await bcrypt.hash("123456", 10); // default password: 123456
      await pool.query(
        `INSERT INTO users (name, email, password, role, area, created_at) 
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [u.name, u.email, hashedPassword, u.role, u.area]
      );
    }

    console.log("✅ Users berhasil di-seed dengan password 123456");
    process.exit();
  } catch (err) {
    console.error("❌ Gagal seed users:", err);
    process.exit(1);
  }
}

seedUsers();
