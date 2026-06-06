// Global Error Handling Middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev environment
  console.error("🚨 Error Caught:", err);

  // Mongoose Bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource not found with id of ${err.value}`;
    return res.status(404).json({ error: message });
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for field: ${field}. Please use another value.`;
    return res.status(400).json({ error: message });
  }

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map(val => val.message).join(", ");
    return res.status(400).json({ error: message });
  }

  // Default server error
  res.status(error.statusCode || 500).json({
    error: error.message || "Internal Server Error"
  });
};

module.exports = errorHandler;
