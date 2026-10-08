export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!result.success) {
    return res.status(422).json({ success: false, message: result.error.issues[0]?.message || 'Data tidak valid' });
  }
  req.validated = result.data;
  next();
};
