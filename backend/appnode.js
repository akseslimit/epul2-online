// ================== IMPORT MODULES ==================
const { Client } = require('pg');
const XLSX = require('xlsx');
const inquirer = require('inquirer');
require('dotenv').config();

// ================== KONEKSI DATABASE ==================
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'Oktasyna!!!89',
  database: process.env.DB_NAME || 'mydb'
});

// ================== MENU UTAMA ==================
async function main() {
  await client.connect();
  console.log("✅ Terhubung ke PostgreSQL");

  while (true) {
    const action = await inquirer.prompt([
      {
        type: 'list',
        name: 'menu',
        message: 'Pilih menu:',
        choices: [
          'Tambah Produk',
          'Tambah Toko',
          'Tambah User',
          'Input Penjualan',
          'Input Distribusi',
          'Reports',
          'Dashboard Report',
          'Keluar'
        ]
      }
    ]);

    if (action.menu === 'Tambah Produk') await tambahProduk();
    if (action.menu === 'Tambah Toko') await tambahToko();
    if (action.menu === 'Tambah User') await tambahUser();
    if (action.menu === 'Input Penjualan') await inputPenjualan();
    if (action.menu === 'Input Distribusi') await inputDistribusi();
    if (action.menu === 'Reports') await reportsMenu();
    if (action.menu === 'Dashboard Report') await dashboardReport();
    if (action.menu === 'Keluar') {
      console.log("👋 Bye!");
      break;
    }
  }

  await client.end();
}

// ================== CRUD FUNCTIONS ==================
async function tambahProduk() {
  const data = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Nama produk:' },
    { type: 'input', name: 'sku', message: 'SKU produk:' },
    { type: 'number', name: 'price', message: 'Harga produk:' }
  ]);

  await client.query(
    `INSERT INTO products (name, sku, price)
     VALUES ($1, $2, $3)
     ON CONFLICT (sku) DO NOTHING`,
    [data.name, data.sku, data.price]
  );

  console.log("✅ Produk ditambahkan");
}

async function tambahToko() {
  const data = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Nama toko:' },
    { type: 'input', name: 'area', message: 'Area toko:' }
  ]);

  await client.query(
    `INSERT INTO stores (name, area)
     VALUES ($1, $2)
     ON CONFLICT (name) DO NOTHING`,
    [data.name, data.area]
  );

  console.log("✅ Toko ditambahkan");
}

async function tambahUser() {
  const data = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Nama user:' },
    { type: 'input', name: 'email', message: 'Email user:' },
    { type: 'list', name: 'role', message: 'Role user:', choices: ['admin', 'sales', 'outlet', 'gudang'] },
    { type: 'input', name: 'area', message: 'Area user:' }
  ]);

  await client.query(
    `INSERT INTO users (id, name, email, role, area)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    [data.name, data.email, data.role, data.area]
  );

  console.log("✅ User ditambahkan");
}

async function inputPenjualan() {
  const data = await inquirer.prompt([
    { type: 'input', name: 'product_sku', message: 'SKU produk:' },
    { type: 'input', name: 'salesman_email', message: 'Email salesman:' },
    { type: 'input', name: 'store_name', message: 'Nama toko:' },
    { type: 'number', name: 'quantity', message: 'Jumlah terjual:' }
  ]);

  const product = await client.query('SELECT id, price FROM products WHERE sku=$1', [data.product_sku]);
  const user = await client.query('SELECT id FROM users WHERE email=$1', [data.salesman_email]);
  const store = await client.query('SELECT id FROM stores WHERE name=$1', [data.store_name]);

  if (!product.rows.length || !user.rows.length || !store.rows.length) {
    console.log("❌ Data tidak valid");
    return;
  }

  const total_price = product.rows[0].price * data.quantity;

  await client.query(
    `INSERT INTO sales_transactions (id, product_id, salesman_id, store_id, quantity, total_price)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
    [product.rows[0].id, user.rows[0].id, store.rows[0].id, data.quantity, total_price]
  );

  console.log("✅ Penjualan dicatat");
}

async function inputDistribusi() {
  const data = await inquirer.prompt([
    { type: 'input', name: 'product_sku', message: 'SKU produk:' },
    { type: 'input', name: 'from_store', message: 'Dari toko:' },
    { type: 'input', name: 'to_store', message: 'Ke toko:' },
    { type: 'number', name: 'quantity', message: 'Jumlah didistribusikan:' }
  ]);

  const product = await client.query('SELECT id FROM products WHERE sku=$1', [data.product_sku]);
  const fromStore = await client.query('SELECT id FROM stores WHERE name=$1', [data.from_store]);
  const toStore = await client.query('SELECT id FROM stores WHERE name=$1', [data.to_store]);

  if (!product.rows.length || !fromStore.rows.length || !toStore.rows.length) {
    console.log("❌ Data tidak valid");
    return;
  }

  await client.query(
    `INSERT INTO distribution (id, product_id, from_store_id, to_store_id, quantity, status)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)`,
    [product.rows[0].id, fromStore.rows[0].id, toStore.rows[0].id, data.quantity, 'pending']
  );

  console.log("✅ Distribusi dicatat");
}

// ================== REPORTS ==================
async function reportsMenu() {
  const choice = await inquirer.prompt([
    {
      type: 'list',
      name: 'report',
      message: 'Pilih laporan:',
      choices: [
        'Total Penjualan per Produk',
        'Stok per Toko',
        'Distribusi per Status',
        'Penjualan per Salesman',
        'Penjualan Produk + Salesman',
        'Lihat Data User',
        'Kembali'
      ]
    }
  ]);

  let query = "";
  let fileName = "";

  if (choice.report === 'Total Penjualan per Produk') {
    query = `
      SELECT p.name AS product, SUM(s.quantity) AS total_sold, SUM(s.total_price) AS total_revenue
      FROM sales_transactions s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.name
      ORDER BY total_sold DESC;
    `;
    fileName = "report_penjualan_per_produk.xlsx";
  }

  if (choice.report === 'Stok per Toko') {
    query = `
      SELECT st.name AS store, p.name AS product, s.quantity
      FROM stock s
      JOIN stores st ON s.store_id = st.id
      JOIN products p ON s.product_id = p.id
      ORDER BY st.name, p.name;
    `;
    fileName = "report_stok_per_toko.xlsx";
  }

  if (choice.report === 'Distribusi per Status') {
    query = `
      SELECT status, COUNT(*) AS jumlah_distribusi, SUM(quantity) AS total_barang
      FROM distribution
      GROUP BY status;
    `;
    fileName = "report_distribusi.xlsx";
  }

  if (choice.report === 'Penjualan per Salesman') {
    query = `
      SELECT u.name AS salesman, SUM(s.quantity) AS total_item, SUM(s.total_price) AS total_sales
      FROM sales_transactions s
      JOIN users u ON s.salesman_id = u.id
      GROUP BY u.name
      ORDER BY total_sales DESC;
    `;
    fileName = "report_penjualan_per_salesman.xlsx";
  }

  if (choice.report === 'Penjualan Produk + Salesman') {
    query = `
      SELECT p.name AS product, u.name AS salesman, SUM(s.quantity) AS total_sold, SUM(s.total_price) AS total_revenue
      FROM sales_transactions s
      JOIN products p ON s.product_id = p.id
      JOIN users u ON s.salesman_id = u.id
      GROUP BY p.name, u.name
      ORDER BY total_revenue DESC;
    `;
    fileName = "report_produk_salesman.xlsx";
  }

  if (choice.report === 'Lihat Data User') {
    query = `
      SELECT id, name, email, role, area, created_at
      FROM users
      ORDER BY created_at DESC;
    `;
    fileName = "data_users.xlsx";
  }

  if (query) {
    const res = await client.query(query);
    console.table(res.rows);

    // export ke Excel
    const ws = XLSX.utils.json_to_sheet(res.rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, fileName);

    console.log(`📂 Laporan diexport ke file: ${fileName}`);
  }
}

// ================== DASHBOARD REPORT ==================
async function dashboardReport() {
  console.log("⏳ Membuat laporan dashboard...");

  const queries = {
    "PenjualanPerProduk": `
      SELECT p.name AS product, SUM(s.quantity) AS total_sold, SUM(s.total_price) AS total_revenue
      FROM sales_transactions s
      JOIN products p ON s.product_id = p.id
      GROUP BY p.name
      ORDER BY total_sold DESC;
    `,
    "StokPerToko": `
      SELECT st.name AS store, p.name AS product, s.quantity
      FROM stock s
      JOIN stores st ON s.store_id = st.id
      JOIN products p ON s.product_id = p.id
      ORDER BY st.name, p.name;
    `,
    "DistribusiPerStatus": `
      SELECT status, COUNT(*) AS jumlah_distribusi, SUM(quantity) AS total_barang
      FROM distribution
      GROUP BY status;
    `,
    "PenjualanPerSalesman": `
      SELECT u.name AS salesman, SUM(s.quantity) AS total_item, SUM(s.total_price) AS total_sales
      FROM sales_transactions s
      JOIN users u ON s.salesman_id = u.id
      GROUP BY u.name
      ORDER BY total_sales DESC;
    `,
    "Produk+Salesman": `
      SELECT p.name AS product, u.name AS salesman, SUM(s.quantity) AS total_sold, SUM(s.total_price) AS total_revenue
      FROM sales_transactions s
      JOIN products p ON s.product_id = p.id
      JOIN users u ON s.salesman_id = u.id
      GROUP BY p.name, u.name
      ORDER BY total_revenue DESC;
    `,
    "DataUser": `
      SELECT id, name, email, role, area, created_at
      FROM users
      ORDER BY created_at DESC;
    `
  };

  const wb = XLSX.utils.book_new();

  for (let [sheetName, query] of Object.entries(queries)) {
    const res = await client.query(query);
    console.table(res.rows);
    const ws = XLSX.utils.json_to_sheet(res.rows);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  }

  const fileName = "dashboard_report.xlsx";
  XLSX.writeFile(wb, fileName);

  console.log(`📊 Dashboard report selesai! File disimpan: ${fileName}`);
}

// ================== JALANKAN APP ==================
main().catch(err => console.error(err));
