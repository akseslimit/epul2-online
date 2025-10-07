const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcrypt");

// GET halaman login (EJS)
router.get("/login", (req, res) => {
  res.render("login", { title: "Admin Login", error: null });
});

// POST login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email.trim()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email atau password salah!" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Email atau password salah!" });
    }

    // simpan ke session
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.json({ user: req.session.user });
  } catch (err) {
    console.error("🔥 Error di login:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET user dari session
router.get("/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.json({ user: req.session.user });
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out" });
  });
});

module.exports = router;
