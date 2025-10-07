const express = require("express");
const router = express.Router();
const pool = require("../db");

// ==================== VIEW (EJS) ====================

// List sales untuk laporan EJS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, p.name AS product, u.name AS salesman, st.name AS store,
             s.quantity, s.total_price, s.transaction_date
      FROM sales_transactions s
      JOIN products p ON s.product_id = p.id
      JOIN users u ON s.salesman_id = u.id
      JOIN stores st ON s.store_id = st.id
      ORDER BY s.transaction_date DESC
    `);

    res.render("layout", {
      title: "Daftar Penjualan",
      content: "sales",   // pastikan ada views/sales.ejs
      data: result.rows
    });
  } catch (err) {
    console.error("Error fetching sales (EJS):", err.message);
    res.status(500).send("Database error");
  }
});

// Form tambah sales (EJS)
router.get("/add", async (req, res) => {
  try {
    const products = await pool.query("SELECT id, name, price FROM products ORDER BY name");
    const users = await pool.query("SELECT id, name FROM users WHERE role='sales' ORDER BY name");
    const stores = await pool.query("SELECT id, name FROM stores ORDER BY name");

    res.render("layout", {
      title: "Tambah Penjualan",
      content: "sales_add",   // pastikan ada views/sales_add.ejs
      products: products.rows,
      users: users.rows,
      stores: stores.rows
    });
  } catch (err) {
    console.error("Error showing sales add form:", err.message);
    res.status(500).send("Database error");
  }
});

// Simpan sales baru dari form EJS
router.post("/add", async (req, res) => {
  try {
    const { product_id, salesman_id, store_id, quantity } = req.body;

    const product = await pool.query("SELECT price FROM products WHERE id=$1", [product_id]);
    if (product.rows.length === 0) {
      return res.status(400).send("Produk tidak ditemukan");
    }

    const total_price = product.rows[0].price * quantity;

    await pool.query(
      `INSERT INTO sales_transactions (product_id, salesman_id, store_id, quantity, total_price, transaction_date)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [product_id, salesman_id, store_id, quantity, total_price]
    );

    // update stok
    await pool.query(
      `UPDATE stock 
       SET quantity = GREATEST(0, quantity - $1)
       WHERE product_id = $2 AND store_id = $3`,
      [quantity, product_id, store_id]
    );

    res.redirect("/sales");
  } catch (err) {
    console.error("Error saving sales (EJS):", err.message);
    res.status(500).send("Database error");
  }
});

// ==================== API JSON ====================

// Get list sales untuk frontend React
router.get("/api", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.quantity, s.total_price, s.transaction_date,
             p.id AS product_id, p.name AS product_name,
             u.id AS salesman_id, u.name AS salesman_name,
             st.id AS store_id, st.name AS store_name
      FROM sales_transactions s
      JOIN products p ON s.product_id = p.id
      JOIN users u ON s.salesman_id = u.id
      JOIN stores st ON s.store_id = st.id
      ORDER BY s.transaction_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching sales (API):", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Create sales dari frontend React
router.post("/api", async (req, res) => {
  try {
    const { product_id, salesman_id, store_id, quantity } = req.body;

    const product = await pool.query("SELECT price FROM products WHERE id=$1", [product_id]);
    if (product.rows.length === 0) {
      return res.status(400).json({ error: "Produk tidak ditemukan" });
    }

    const total_price = product.rows[0].price * quantity;

    const result = await pool.query(
      `INSERT INTO sales_transactions 
       (product_id, salesman_id, store_id, quantity, total_price, transaction_date)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [product_id, salesman_id, store_id, quantity, total_price]
    );

    // update stok
    await pool.query(
      `UPDATE stock 
       SET quantity = GREATEST(0, quantity - $1)
       WHERE product_id = $2 AND store_id = $3`,
      [quantity, product_id, store_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error saving sales (API):", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
