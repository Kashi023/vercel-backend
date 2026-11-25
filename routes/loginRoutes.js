
const express = require("express");
const router = express.Router();

const {
  userLogin,
  doctorLogin
} = require("../controllers/loginController");


// ==========================================
// PATIENT LOGIN
// POST /api/auth/login
// ==========================================

router.post("/login", userLogin);


// ==========================================
// DOCTOR LOGIN
// POST /api/doctors/login
// ==========================================

// Keep this route only if this router is mounted at /api
router.post("/doctors/login", doctorLogin);


module.exports = router;
