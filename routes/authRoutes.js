
const express = require("express");
const router = express.Router();

const { registerUser } = require("../controllers/authController");
const { userLogin } = require("../controllers/loginController");

router.post("/register", registerUser);
router.post("/login", userLogin);

module.exports = router;
