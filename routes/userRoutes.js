
const express = require("express");
const router = express.Router();

// Authentication and authorization middleware
const {
  protect,
  authorizeRole
} = require("../middleware/authMiddleware");

// User controller functions
const {
  getUsers,
  getUserById,
  getUserProfile
} = require("../controllers/userController");


// ==========================================
// GET LOGGED-IN PATIENT PROFILE
// GET /api/users/profile
// ==========================================

router.get(
  "/profile",
  protect,
  authorizeRole("user"),
  getUserProfile
);


// ==========================================
// GET ALL PATIENTS
// GET /api/users
// ==========================================

router.get(
  "/",
  protect,
  authorizeRole("doctor"),
  getUsers
);


// ==========================================
// GET PATIENT BY ID
// GET /api/users/:id
// ==========================================

router.get(
  "/:id",
  protect,
  authorizeRole("doctor"),
  getUserById
);


// ==========================================
// EXPORT ROUTER
// ==========================================

module.exports = router;
