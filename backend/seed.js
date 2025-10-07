require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "password",
  database: process.env.DB_NAME || "mydb",
  port: process.env.DB_PORT || 5432,
});

async function seed() {
  try {
    await client.connect();
    console.log("✅ Terhubung ke PostgreSQL");

    // Insert dummy users
    await client.query(`
      INSERT INTO users (id, name, email, role, area) VALUES
        (gen_random_uuid(), 'Admin User', 'admin@example.com', 'admin', 'Jakarta Pusat'),
        (gen_random_uuid(), 'Sales User', 'sales@example.com', 'sales', 'Jakarta Utara'),
        (gen_random_uuid(), 'Outlet User', 'outlet@example.com', 'outlet', 'Jakarta Utara'),
        (gen_random_uuid(), 'Gudang User', 'gudang@example.com', 'gudang', 'Jakarta Pusat')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Insert products
    await client.query(`
      INSERT INTO products (name, sku, price) VALUES
        ('Belgian Rose Parfum', 'BRP-001', 150000),
        ('Brussels Lavender Eau de Toilette', 'BLE-002', 120000),
        ('Antwerp Vanilla Cologne', 'AVC-003', 180000),
        ('Ghent Jasmine Perfume', 'GJP-004', 200000),
        ('Bruges Sandalwood Essence', 'BSE-005', 220000),
        ('Leuven Citrus Fresh', 'LCF-006', 110000),
        ('Mechelen Amber Musk', 'MAM-007', 190000),
        ('Namur Berry Bliss', 'NBB-008', 160000)
      ON CONFLICT (sku) DO NOTHING;
    `);

    // Insert stores
    await client.query(`
      INSERT INTO stores (name, area) VALUES
        ('Central Warehouse', 'Jakarta Pusat'),
        ('North Jakarta Outlet', 'Jakarta Utara'),
        ('South Jakarta Outlet', 'Jakarta Selatan'),
        ('Surabaya Branch', 'Surabaya'),
        ('Bandung Store', 'Bandung'),
        ('Medan Outlet', 'Medan'),
        ('Makassar Branch', 'Makassar')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Insert initial stock (100 per product at Central Warehouse)
    await client.query(`
      INSERT INTO stock (product_id, store_id, quantity)
      SELECT p.id, s.id, 100
      FROM products p, stores s
      WHERE s.name = 'Central Warehouse'
      ON CONFLICT (product_id, store_id) DO NOTHING;
    `);

    // Insert dummy distribution
    await client.query(`
      INSERT INTO distribution (product_id, from_store_id, to_store_id, quantity, status)
      VALUES
        (
          (SELECT id FROM products WHERE sku = 'BRP-001'),
          (SELECT id FROM stores WHERE name = 'Central Warehouse'),
          (SELECT id FROM stores WHERE name = 'North Jakarta Outlet'),
          50,
          'completed'
        ),
        (
          (SELECT id FROM products WHERE sku = 'BLE-002'),
          (SELECT id FROM stores WHERE name = 'Central Warehouse'),
          (SELECT id FROM stores WHERE name = 'Bandung Store'),
          30,
          'pending'
        )
      ON CONFLICT DO NOTHING;
    `);

    // Insert dummy sales
    await client.query(`
      INSERT INTO sales_transactions (product_id, salesman_id, store_id, quantity, total_price)
      VALUES
        (
          (SELECT id FROM products WHERE sku = 'BRP-001'),
          (SELECT id FROM users WHERE email = 'sales@example.com'),
          (SELECT id FROM stores WHERE name = 'North Jakarta Outlet'),
          2,
          300000
        ),
        (
          (SELECT id FROM products WHERE sku = 'GJP-004'),
          (SELECT id FROM users WHERE email = 'sales@example.com'),
          (SELECT id FROM stores WHERE name = 'South Jakarta Outlet'),
          1,
          200000
        )
      ON CONFLICT DO NOTHING;
    `);

    console.log("🎉 Semua dummy data berhasil dimasukkan");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.end();
    console.log("🔌 Koneksi ditutup");
  }
}

seed();
