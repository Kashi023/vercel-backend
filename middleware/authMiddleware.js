
const jwt = require("jsonwebtoken");

// ==========================================
// AUTHENTICATION MIDDLEWARE
// ==========================================

const protect = (req, res, next) => {
  try {
    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error"
      });
    }

    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication token required"
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization header"
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Get user ID
    const userId = decoded.id || decoded._id || decoded.userId;

    // Validate decoded information
    if (!userId || !decoded.role) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: User information missing"
      });
    }

    // Attach authenticated user to request
    req.user = {
      ...decoded,
      id: userId.toString(),
      role: decoded.role
    };

    next();

  } catch (error) {
    console.error("Authentication error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please login again."
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token"
    });
  }
};


// ==========================================
// ROLE AUTHORIZATION MIDDLEWARE
// ==========================================

const authorizeRole = (...roles) => {
  return (req, res, next) => {

    // Check authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Please login first"
      });
    }

    // Check user role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to access this resource"
      });
    }

    next();
  };
};


// ==========================================
// EXPORT MIDDLEWARE
// ==========================================

module.exports = {
  protect,
  authorizeRole
};
