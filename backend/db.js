require("dotenv").config();
const { Client } = require("pg");

const client = new Client({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "Oktasyna!!!89",
  database: process.env.DB_NAME || "mydb",
  port: process.env.DB_PORT || 5432,
});

client.connect()
  .then(() => console.log("✅ Terhubung ke PostgreSQL"))
  .catch(err => console.error("❌ Error koneksi:", err));

module.exports = client;
