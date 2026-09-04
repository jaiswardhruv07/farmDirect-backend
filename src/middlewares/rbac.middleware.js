const requirePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roleId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userPermissions =
      req.user.roleId.permissionIds?.map((permission) => permission.name) || [];

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
    if (!req.user || !req.user.roleId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const userPermissions =
      req.user.roleId.permissionIds?.map((permission) => permission.name) || [];

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

module.exports = {
  requirePermissions,
  requireAnyPermission
};
