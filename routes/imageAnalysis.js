
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    cb(new Error("Only JPG, PNG, and WebP images are allowed."));
  },
});

router.post("/", (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a chest X-ray image.",
      });
    }

    try {
      const form = new FormData();

      form.append("image", req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });

      const response = await axios.post(
        "http://127.0.0.1:5001/predict-image",
        form,
        {
          headers: form.getHeaders(),
          timeout: 55000,
          maxBodyLength: Infinity,
        }
      );

      console.log("Image prediction response:", response.data);

      return res.status(200).json({
        success: true,
        ...response.data,
      });
    } catch (error) {
      console.error(
        "Image ML service error:",
        error.response?.data || error.message
      );

      const status = error.response?.status === 400 ? 400 : 503;

      return res.status(status).json({
        success: false,
        message:
          error.response?.data?.message ||
          "Image analysis failed. Check that the Flask service and image model are running.",
      });
    }
  });
});

module.exports = router;
