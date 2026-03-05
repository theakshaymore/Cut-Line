const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

const isCustomer = requireRole("customer");
const isBarber = requireRole("barber");
const isAdmin = requireRole("admin");

export { requireRole, isCustomer, isBarber, isAdmin };
