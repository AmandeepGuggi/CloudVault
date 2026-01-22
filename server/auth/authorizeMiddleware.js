import { ROLES } from "../config/roles.js";

export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    // 1. Auth guard
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.user.role;
    const rolePermissions = ROLES[role];

    // 2. Role sanity check
    if (!rolePermissions) {
      return res.status(403).json({ message: "Invalid role" });
    }

    // 3. Permission check
    if (!rolePermissions.includes(requiredPermission)) {
      return res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
    }

    next();
  };
};
