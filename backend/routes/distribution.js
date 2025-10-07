const express = require("express");
const router = express.Router();
const pool = require("../db");

// ==================== VIEW (EJS) ====================

// List distribusi untuk laporan EJS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.id, p.name AS product, fs.name AS from_store, ts.name AS to_store,
             d.quantity, d.status, d.distribution_date
      FROM distribution d
      JOIN products p ON d.product_id = p.id
      JOIN stores fs ON d.from_store_id = fs.id
      JOIN stores ts ON d.to_store_id = ts.id
      ORDER BY d.distribution_date DESC
    `);

    res.render("layout", {
      title: "Daftar Distribusi",
      content: "distribution",
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching distributions:", err.message);
    res.send("Database error");
  }
});

// Form tambah distribusi (opsional, kalau butuh UI EJS)
router.get("/add", async (req, res) => {
  try {
    const products = await pool.query("SELECT id, name FROM products ORDER BY name");
    const stores = await pool.query("SELECT id, name FROM stores ORDER BY name");

    res.render("layout", {
      title: "Tambah Distribusi",
      content: "distribution_add",
      products: products.rows,
      stores: stores.rows
    });
  } catch (err) {
    console.error("Error showing distribution form:", err.message);
    res.send("Database error");
  }
});

// ==================== API JSON ====================

// GET semua distribusi
router.get("/api", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.id, p.name AS product, fs.name AS from_store, ts.name AS to_store,
             d.quantity, d.status, d.distribution_date
      FROM distribution d
      JOIN products p ON d.product_id = p.id
      JOIN stores fs ON d.from_store_id = fs.id
      JOIN stores ts ON d.to_store_id = ts.id
      ORDER BY d.distribution_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching API distribution:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// POST buat distribusi baru
router.post("/api", async (req, res) => {
  try {
    const { product_id, from_store_id, to_store_id, quantity } = req.body;

    // Insert distribusi
    const result = await pool.query(
      `INSERT INTO distribution (product_id, from_store_id, to_store_id, quantity, distribution_date, status)
       VALUES ($1, $2, $3, $4, NOW(), 'pending') RETURNING *`,
      [product_id, from_store_id, to_store_id, quantity]
    );

    // Kurangi stok dari source
    await pool.query(
      `UPDATE stock SET quantity = quantity - $1
       WHERE product_id=$2 AND store_id=$3`,
      [quantity, product_id, from_store_id]
    );

    // Tambah stok ke tujuan
    const destCheck = await pool.query(
      `SELECT id FROM stock WHERE product_id=$1 AND store_id=$2`,
      [product_id, to_store_id]
    );

    if (destCheck.rows.length > 0) {
      await pool.query(
        `UPDATE stock SET quantity = quantity + $1
         WHERE product_id=$2 AND store_id=$3`,
        [quantity, product_id, to_store_id]
      );
    } else {
      await pool.query(
        `INSERT INTO stock (product_id, store_id, quantity)
         VALUES ($1, $2, $3)`,
        [product_id, to_store_id, quantity]
      );
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error saving API distribution:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// PATCH tandai distribusi selesai
router.patch("/api/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE distribution SET status='completed' WHERE id=$1 RETURNING *`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error completing distribution:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
