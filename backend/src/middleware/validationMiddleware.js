export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (error) {
    const formattedErrors = {};
    if (error.errors) {
      error.errors.forEach((err) => {
        const pathStr = err.path.slice(1).join('.');
        formattedErrors[pathStr || 'general'] = err.message;
      });
    }
    return res.status(422).json({
      success: false,
      message: 'Validation Error',
      errors: formattedErrors
    });
  }
};
