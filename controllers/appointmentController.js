
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

// =====================================
// 1. USER SENDS APPOINTMENT REQUEST
// =====================================

const createAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, reason } = req.body;

    // Validate required fields
    if (!doctorId || !appointmentDate || !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide all appointment details"
      });
    }

    // Validate MongoDB Doctor ID
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID"
      });
    }

    // Find doctor in Doctor collection
    const doctor = await Doctor.findById(doctorId);

    if (!doctor || doctor.available === false) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or currently unavailable"
      });
    }

    // Find linked doctor login account
    const doctorUser = await User.findById(doctor.userId);

    if (!doctorUser || doctorUser.role !== "doctor") {
      return res.status(404).json({
        success: false,
        message: "Doctor account not found"
      });
    }

    // Validate appointment date
    const date = new Date(appointmentDate);

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid future appointment date"
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: req.user.id,
      doctor: doctorUser._id,
      appointmentDate: date,
      reason: reason.trim(),
      status: "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request sent successfully",
      appointment
    });

  } catch (error) {
    console.error("Create appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
      error: error.message
    });
  }
};


// =====================================
// 2. DOCTOR SEES INCOMING REQUESTS
// =====================================

const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      doctor: req.user.id
    })
      .populate("patient", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {
    console.error("Get doctor appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctor appointments",
      error: error.message
    });
  }
};


// =====================================
// 3. DOCTOR ACCEPTS OR REJECTS REQUEST
// =====================================

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    // Find appointment belonging to logged-in doctor
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      doctor: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    // Only accepted appointments can be completed
    if (
      status === "completed" &&
      appointment.status !== "accepted"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only accepted appointments can be completed"
      });
    }

    // Only pending appointments can be accepted or rejected
    if (
      ["accepted", "rejected"].includes(status) &&
      appointment.status !== "pending"
    ) {
      return res.status(400).json({
        success: false,
        message: "This appointment has already been processed"
      });
    }

    appointment.status = status;
    await appointment.save();

    return res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
      appointment
    });

  } catch (error) {
    console.error("Update appointment status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update appointment status",
      error: error.message
    });
  }
};


// =====================================
// 4. USER SEES THEIR APPOINTMENTS
// =====================================

const getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({
      patient: req.user.id
    })
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {
    console.error("Get user appointments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user appointments",
      error: error.message
    });
  }
};


// =====================================
// 5. USER CANCELS PENDING REQUEST
// =====================================

const cancelAppointment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID"
      });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      patient: req.user.id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found"
      });
    }

    if (appointment.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointments can be cancelled"
      });
    }

    await appointment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully"
    });

  } catch (error) {
    console.error("Cancel appointment error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: error.message
    });
  }
};


// =====================================
// EXPORT ALL FUNCTIONS
// =====================================

module.exports = {
  createAppointment,
  getDoctorAppointments,
  updateAppointmentStatus,
  getUserAppointments,
  cancelAppointment
};
