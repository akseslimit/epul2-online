const app = require("./app");
require("dotenv").config();

const PORT = process.env.PORT || 4000; // ubah default ke 4000

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
