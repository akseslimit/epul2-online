const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET dashboard stats
router.get("/", async (req, res) => {
  try {
    // total products
    const products = await pool.query("SELECT COUNT(*) FROM products");

    // total stores
    const stores = await pool.query("SELECT COUNT(*) FROM stores");

    // total stock
    const stock = await pool.query("SELECT COALESCE(SUM(quantity),0) FROM stock");

    // sales today
    const today = new Date().toISOString().split("T")[0];
    const sales = await pool.query(
      "SELECT COUNT(*) FROM sales_transactions WHERE DATE(transaction_date) = $1",
      [today]
    );

    // recent 5 sales
    const recentSales = await pool.query(`
      SELECT 
        s.id,
        p.name AS product_name,
        u.name AS salesman_name,
        st.name AS store_name,
        s.total_price,
        s.quantity,
        s.transaction_date
      FROM sales_transactions s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN users u ON s.salesman_id = u.id
      LEFT JOIN stores st ON s.store_id = st.id
      ORDER BY s.transaction_date DESC
      LIMIT 5
    `);

    res.json({
      totalProducts: parseInt(products.rows[0].count),
      totalStores: parseInt(stores.rows[0].count),
      totalStock: parseInt(stock.rows[0].coalesce),
      salesToday: parseInt(sales.rows[0].count),
      recentSales: recentSales.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ error: "Error fetching dashboard stats" });
  }
});

module.exports = router;
