const express = require("express");
const router = express.Router();

const {
  registerDoctor,
  getAllDoctors,
  getDoctorProfile,
} = require("../controllers/doctorController");

const { doctorLogin } = require("../controllers/loginController");

const {
  protect,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.post("/register", registerDoctor);
router.post("/login", doctorLogin);

router.get("/", getAllDoctors);

router.get(
  "/profile",
  protect,
  authorizeRole("doctor"),
  getDoctorProfile
);

module.exports = router;