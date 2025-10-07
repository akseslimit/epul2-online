const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all stock with JOIN
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.quantity, s.created_at,
             p.name AS product_name, p.sku,
             st.name AS store_name, st.area
      FROM stock s
      JOIN products p ON s.product_id = p.id
      JOIN stores st ON s.store_id = st.id
      ORDER BY s.created_at DESC
    `);
    res.json(result.rows); // kirim JSON
  } catch (err) {
    console.error("Error fetching stock:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ADD stock
router.post("/", async (req, res) => {
  try {
    const { product_id, store_id, quantity } = req.body;
    const result = await pool.query(
      `INSERT INTO stock (product_id, store_id, quantity, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING *`,
      [product_id, store_id, quantity]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error adding stock:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE stock
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_id, store_id, quantity } = req.body;
    const result = await pool.query(
      `UPDATE stock
       SET product_id=$1, store_id=$2, quantity=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [product_id, store_id, quantity, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating stock:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE stock
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM stock WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting stock:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
