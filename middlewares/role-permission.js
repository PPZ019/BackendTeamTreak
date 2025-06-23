function hasPermission(required) {
    return async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id).populate("role");
        if (!user.role.permissions.includes(required)) {
          return res.status(403).json({ message: "Access Denied" });
        }
        next();
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    };
  }
  
  