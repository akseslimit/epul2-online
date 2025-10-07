const express = require("express");
const router = express.Router();
const pool = require("../db");

// ================== GET all stores ==================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, area FROM stores ORDER BY name"
    );
    console.log("🔥 Stores fetched:", result.rows.length, "records");
    res.json(result.rows); // kirim JSON ke frontend
  } catch (err) {
    console.error("❌ Error fetching stores:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ================== GET single store ==================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM stores WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error fetching store:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ================== CREATE new store ==================
router.post("/", async (req, res) => {
  try {
    const { name, area } = req.body;

    const result = await pool.query(
      "INSERT INTO stores (name, area, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [name, area]
    );

    console.log("✅ Store created:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error creating store:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ================== UPDATE store ==================
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, area } = req.body;

    const result = await pool.query(
      "UPDATE stores SET name = $1, area = $2 WHERE id = $3 RETURNING *",
      [name, area, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    console.log("✏️ Store updated:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("❌ Error updating store:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// ================== DELETE store ==================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM stores WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Store not found" });
    }

    console.log("🗑️ Store deleted:", result.rows[0]);
    res.json({ message: "Store deleted", store: result.rows[0] });
  } catch (err) {
    console.error("❌ Error deleting store:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
