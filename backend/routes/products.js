const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================== MULTER SETUP ==================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/uploads/")); // ABSOLUTE PATH lebih aman
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
  },
});
const upload = multer({ storage });

// ================== ROUTES ==================

// ✅ Ambil semua produk
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, sku, price, discount, image_url, created_at FROM products ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching products:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Tambah produk baru
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, sku, price, discount } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      "INSERT INTO products (name, sku, price, discount, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, sku, price, discount || 0, image_url]
    );

    res.json({ message: "Product created", product: result.rows[0] });
  } catch (err) {
    console.error("❌ Error creating product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update produk
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, discount, old_image } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : old_image;

    const result = await pool.query(
      "UPDATE products SET name=$1, sku=$2, price=$3, discount=$4, image_url=$5 WHERE id=$6 RETURNING *",
      [name, sku, price, discount || 0, image_url, id]
    );

    res.json({ message: "Product updated", product: result.rows[0] });
  } catch (err) {
    console.error("❌ Error updating product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Hapus produk + hapus file gambar kalau ada
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // cari image_url dulu
    const find = await pool.query("SELECT image_url FROM products WHERE id=$1", [id]);
    if (find.rows.length > 0 && find.rows[0].image_url) {
      const imagePath = path.join(__dirname, "../public", find.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath); // hapus file fisik
      }
    }

    await pool.query("DELETE FROM products WHERE id=$1", [id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("❌ Error deleting product:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
