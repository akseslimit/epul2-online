const express = require("express");
const router = express.Router();
const pool = require("../db");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");

// Konfigurasi upload
const upload = multer({ dest: "uploads/" });

// Halaman utama Import/Export
router.get("/", (req, res) => {
  res.render("layout", { title: "Import / Export", content: "import-export" });
});

// Download Template
router.get("/template/:table", (req, res) => {
  const { table } = req.params;

  let data = [];
  if (table === "users") {
    data = [{ Name: "", Email: "", Role: "admin/sales/outlet/gudang", Area: "" }];
  }
  if (table === "products") {
    data = [{ Name: "", SKU: "", Price: "" }];
  }
  if (table === "sales") {
    data = [{ Product: "", Salesman: "", Store: "", Quantity: "" }];
  }
  if (table === "distribution") {
    data = [{ Product: "", FromStore: "", ToStore: "", Quantity: "", Status: "pending/completed" }];
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");

  const filePath = path.join(__dirname, `../downloads/template_${table}.xlsx`);
  XLSX.writeFile(wb, filePath);
  res.download(filePath);
});

// Import XLSX
router.post("/upload/:table", upload.single("file"), async (req, res) => {
  try {
    const { table } = req.params;
    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    for (let row of rows) {
      if (table === "users") {
        await pool.query(
          "INSERT INTO users (id, name, email, role, area) VALUES (gen_random_uuid(), $1, $2, $3, $4) ON CONFLICT (email) DO NOTHING",
          [row.Name, row.Email, row.Role, row.Area]
        );
      }
      if (table === "products") {
        await pool.query(
          "INSERT INTO products (name, sku, price) VALUES ($1, $2, $3) ON CONFLICT (sku) DO NOTHING",
          [row.Name, row.SKU, row.Price]
        );
      }
      if (table === "sales") {
        await pool.query(
          `INSERT INTO sales_transactions (product_id, salesman_id, store_id, quantity, total_price)
           VALUES (
             (SELECT id FROM products WHERE name=$1),
             (SELECT id FROM users WHERE name=$2),
             (SELECT id FROM stores WHERE name=$3),
             $4,
             (SELECT price FROM products WHERE name=$1) * $4
           )`,
          [row.Product, row.Salesman, row.Store, row.Quantity]
        );
      }
      if (table === "distribution") {
        await pool.query(
          `INSERT INTO distribution (product_id, from_store_id, to_store_id, quantity, status)
           VALUES (
             (SELECT id FROM products WHERE name=$1),
             (SELECT id FROM stores WHERE name=$2),
             (SELECT id FROM stores WHERE name=$3),
             $4,
             $5
           )`,
          [row.Product, row.FromStore, row.ToStore, row.Quantity, row.Status]
        );
      }
    }

    res.send("✅ Data berhasil diimport!");
  } catch (err) {
    console.error(err);
    res.send("❌ Gagal import data");
  }
});

module.exports = router;
