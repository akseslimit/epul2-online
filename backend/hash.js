const bcrypt = require("bcrypt");

(async () => {
  const plain = "admin123";
  const hash = await bcrypt.hash(plain, 10);
  console.log("Hash baru untuk", plain, ":", hash);
})();
