const validate = (schema) => (req, res, next) => {
  try {
    // Validate request body
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.errors.map(err => `${err.path.join(".")}: ${err.message}`).join(", ");
      return res.status(400).json({ error: errorMsg });
    }
    // Override req.body with the parsed/validated data (to apply coercion, defaults, etc.)
    req.body = parsed.data;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = validate;
