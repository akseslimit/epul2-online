// ================== FIX: Paksa Node pakai IPv6 dulu ==================
process.env.NODE_OPTIONS = "--dns-result-order=ipv6first";
const dns = require("dns");
dns.setDefaultResultOrder("ipv6first");
// ================================================================
const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const readline = require("readline");
require("dotenv").config();

const { connectDatabase } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ================== MIDDLEWARE ==================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

<<<<<<< HEAD
=======
// ✅ CORS (support lokal + Railway + frontend online)
const allowedOrigins = [
  "http://localhost:5173", // frontend lokal
  "https://epul2-online-production.up.railway.app", // backend online
  "https://namadomainfrontendkamu.vercel.app", // nanti frontend deploy
];

>>>>>>> 5febf52f4296278d5750e56db24e46589332dccc
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

<<<<<<< HEAD
=======
// ✅ Session
>>>>>>> 5febf52f4296278d5750e56db24e46589332dccc
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
<<<<<<< HEAD
      secure: false,
=======
      secure: process.env.NODE_ENV === "production", // aktif hanya di HTTPS
>>>>>>> 5febf52f4296278d5750e56db24e46589332dccc
      sameSite: "lax",
      maxAge: 1000 * 60 * 60,
    },
  })
);

<<<<<<< HEAD
=======
// ✅ Serve file upload
>>>>>>> 5febf52f4296278d5750e56db24e46589332dccc
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ================== ROUTES ==================
app.use("/users", require("./routes/users"));
app.use("/products", require("./routes/products"));
app.use("/stores", require("./routes/stores"));
app.use("/stock", require("./routes/stock"));
app.use("/sales", require("./routes/sales"));
app.use("/distribution", require("./routes/distribution"));
app.use("/import-export", require("./routes/importExport"));
app.use("/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/reports", require("./routes/reports"));

<<<<<<< HEAD
// ================== MIDDLEWARE CEK LOGIN ==================
=======
// ================== CEK LOGIN ==================
>>>>>>> 5febf52f4296278d5750e56db24e46589332dccc
function requireLogin(req, res, next) {
  if (!req.session.user) {
    if (req.originalUrl.startsWith("/api") || req.headers.accept?.includes("application/json")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.redirect("/auth/login");
  }
  next();
}

// ================== HOMEPAGE ==================
app.get("/", requireLogin, (req, res) => {
  res.render("home", { title: "Dashboard Backend", user: req.session.user });
});

// ================== 404 HANDLER ==================
app.use((req, res) => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(404).json({ error: "API endpoint not found" });
  } else {
    res.status(404).render("404", { title: "Not Found" });
  }
});

// ================== ERROR HANDLER ==================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  if (req.originalUrl.startsWith("/api")) {
    res.status(500).json({ error: "Internal Server Error" });
  } else {
    res.status(500).render("500", { title: "Server Error" });
  }
});

<<<<<<< HEAD
// ================== PILIH MODE DATABASE ==================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
=======
// ================== START SERVER ==================
const { connectDatabase } = require("./db"); // ⬅️ pastikan ini ada di atas

// Jalankan koneksi database dulu baru start server
const mode = process.env.DB_MODE || (process.env.NODE_ENV === "production" ? "supabase" : "local");

console.log(`🚀 Starting app in ${process.env.NODE_ENV} mode...`);
console.log(`🧩 Database mode: ${mode}`);

connectDatabase(mode);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
>>>>>>> 5febf52f4296278d5750e56db24e46589332dccc
});

const envMode = process.env.DB_MODE || "local";

if (process.env.NODE_ENV === "production") {
  // 💡 Mode otomatis (tanpa prompt)
  console.log(`🚀 Mode otomatis: ${envMode.toUpperCase()}`);
  connectDatabase(envMode);
  app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
  });
} else {
  // 💬 Mode manual (bisa pilih)
  console.log("\n📦 Pilih mode koneksi database:");
  console.log("1. Lokal");
  console.log("2. Supabase");

  rl.question("Masukkan pilihan (1/2): ", (answer) => {
    const mode = answer.trim() === "2" ? "supabase" : "local";
    connectDatabase(mode);
    app.listen(PORT, () => {
      console.log(`✅ Server running at http://localhost:${PORT}`);
    });
    rl.close();
  });
}
