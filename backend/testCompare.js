const bcrypt = require("bcrypt");

const hash = "$2b$10$j2j49/iiX86j7KS4RzKInuuD5SZjxXEHabEg0U.kJyhuQByfCwue"; // hash dari DB
const input = "admin123";

bcrypt.compare(input, hash).then(result => {
  console.log("Compare result:", result);
});
