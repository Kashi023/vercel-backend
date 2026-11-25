
const express = require("express");
const axios = require("axios");

const router = express.Router();

// POST /api/symptoms/check
router.post("/check", async (req, res) => {
  console.log("1. Received symptom request");

  try {
    const { symptoms } = req.body || {};

    // Step 1: Validate the selected symptoms
    if (
      !Array.isArray(symptoms) ||
      symptoms.length === 0 ||
      !symptoms.every(
        (symptom) =>
          typeof symptom === "string" &&
          symptom.trim().length > 0
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one valid symptom.",
      });
    }

    console.log("2. Sending symptoms to Flask ML service");
    console.log("Selected symptoms:", symptoms);

    // Step 2: Call the Flask ML service on port 5001
    const response = await axios.post(
      "http://127.0.0.1:5001/predict",
      { symptoms },
      { timeout: 10000 }
    );

    console.log("3. Flask response received");
    console.log("Flask response:", response.data);

    const data = response.data;

    // Step 3: Validate the ML response
    if (
      !data ||
      data.success !== true ||
      typeof data.prediction !== "string"
    ) {
      return res.status(502).json({
        success: false,
        message: "The ML service returned an invalid response.",
      });
    }

    // Step 4: Send the expected response format to React
    return res.status(200).json({
      success: true,
      results: [
        {
          condition: data.prediction,
          matchedSymptoms: Array.isArray(data.matchedSymptoms)
            ? data.matchedSymptoms
            : [],
          unmatchedSymptoms: Array.isArray(data.unmatchedSymptoms)
            ? data.unmatchedSymptoms
            : [],
          advice:
            "Educational demonstration only. This is not a medical diagnosis.",
        },
      ],
      disclaimer:
        "This model is not medically validated. Do not use its predictions to diagnose or treat illness.",
    });
  } catch (error) {
    console.error(
      "Symptom analysis error:",
      error.response?.status || "No HTTP status",
      error.response?.data || error.message
    );

    // Flask responded with an HTTP error
    if (error.response) {
      return res.status(502).json({
        success: false,
        message: "The Python ML service returned an error.",
        details: error.response.data,
      });
    }

    // Flask is unreachable or the request timed out
    return res.status(503).json({
      success: false,
      message:
        "Cannot reach the Python ML service. Ensure Flask is running on port 5001.",
      details: error.message,
    });
  }
});

module.exports = router;
