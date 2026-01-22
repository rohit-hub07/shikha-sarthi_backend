// Authentication has been removed. `protect` is kept as a noop middleware for compatibility.
exports.protect = async (req, res, next) => {
  // No auth enforced. Keep req.user undefined for public access.
  req.user = undefined;
  next();
};
