import { ApiError } from "../utils/errorHandler.js";

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Unauthorized — user not found in request"));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        new ApiError(403, `Forbidden — ${userRole} role cannot access this resource`)
      );
    }

    next();
  };
};