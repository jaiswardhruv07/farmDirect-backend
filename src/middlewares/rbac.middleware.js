const getUserPermissions = (user) => {
  if (!user || !user.roleId) {
    return [];
  }

  return user.roleId.permissionIds?.map((permission) => permission.name) || [];
};

const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req.user);

    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};

const requireAnyPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    const userPermissions = getUserPermissions(req.user);

    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to perform this action"
      });
    }

    next();
  };
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    if (!allowedRoles.includes(req.user.roleId.name)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this resource"
      });
    }

    next();
  };
};

module.exports = {
  requirePermissions,
  requireAnyPermission,
  requireRole
};
