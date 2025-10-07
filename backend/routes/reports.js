const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET sales report
router.get("/", async (req, res) => {
  try {
    const { from, to, productId, storeId } = req.query;

    // buat query dasar
    let query = `
      SELECT 
        s.id, s.transaction_date, s.quantity, s.total_price,
        p.name AS product_name, p.sku,
        u.name AS salesman_name,
        st.name AS store_name
      FROM sales_transactions s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN users u ON s.salesman_id = u.id
      LEFT JOIN stores st ON s.store_id = st.id
      WHERE s.transaction_date BETWEEN $1 AND $2
    `;
    const params = [from, to];

    // filter optional
    if (productId) {
      query += ` AND s.product_id = $${params.length + 1}`;
      params.push(productId);
    }

    if (storeId) {
      query += ` AND s.store_id = $${params.length + 1}`;
      params.push(storeId);
    }

    query += ` ORDER BY s.transaction_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching report:", err);
    res.status(500).json({ error: "Error fetching report" });
  }
});

// GET products and stores for dropdown
router.get("/filters", async (req, res) => {
  try {
    const products = await pool.query("SELECT id, name FROM products ORDER BY name");
    const stores = await pool.query("SELECT id, name FROM stores ORDER BY name");
    res.json({ products: products.rows, stores: stores.rows });
  } catch (err) {
    console.error("❌ Error fetching filters:", err);
    res.status(500).json({ error: "Error fetching filters" });
  }
});

module.exports = router;
