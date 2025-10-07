const express = require("express");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================== MIDDLEWARE ==================
// View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static & Body Parser
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ CORS (React frontend di port 5173)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Session untuk login
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // ubah ke true kalau sudah pakai HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 jam
    },
  })
);

// ✅ serve file upload agar bisa diakses frontend
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// ================== ROUTES ==================
app.use("/users", require("./routes/users"));
app.use("/products", require("./routes/products"));
app.use("/stores", require("./routes/stores"));
app.use("/stock", require("./routes/stock")); // JSON API
app.use("/sales", require("./routes/sales"));
app.use("/distribution", require("./routes/distribution"));
app.use("/import-export", require("./routes/importExport"));
app.use("/auth", require("./routes/auth"));
app.use("/api/dashboard", require("./routes/dashboard"));
app.use("/api/reports", require("./routes/reports"));


// ================== MIDDLEWARE CEK LOGIN ==================
function requireLogin(req, res, next) {
  if (!req.session.user) {
    // Kalau request dari frontend (React / API)
    if (req.originalUrl.startsWith("/api") || req.headers.accept?.includes("application/json")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    // Kalau request dari browser langsung (EJS)
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

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
