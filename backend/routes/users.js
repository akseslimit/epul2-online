const express = require("express");
const router = express.Router();
const pool = require("../db"); // koneksi pg Pool
const bcrypt = require("bcrypt");

// Ambil semua user
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching users" });
  }
});

// Tambah user baru
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role, area } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role, area, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *",
      [name, email, hashedPassword, role, area]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating user" });
  }
});

// Update user
router.put("/:id", async (req, res) => {
  try {
    const { name, email, role, area, password } = req.body;
    const { id } = req.params;

    let query = "UPDATE users SET name=$1, email=$2, role=$3, area=$4";
    let values = [name, email, role, area];

    if (password && password.length >= 6) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query += ", password=$5";
      values.push(hashedPassword);
    }

    query += " WHERE id=$" + values.length + " RETURNING *";
    values.push(id);

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating user" });
  }
});

// Hapus user
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting user" });
  }
});

module.exports = router;
