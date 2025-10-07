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

// ✅ CORS (support lokal + Railway + frontend online)
const allowedOrigins = [
  "http://localhost:5173", // frontend lokal
  "https://epul2-online-production.up.railway.app", // backend online
  "https://namadomainfrontendkamu.vercel.app", // nanti frontend deploy
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ✅ Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "rahasia123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // aktif hanya di HTTPS
      sameSite: "lax",
      maxAge: 1000 * 60 * 60, // 1 jam
    },
  })
);

// ✅ Serve file upload
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

// ================== CEK LOGIN ==================
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

// ================== START SERVER ==================
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});

