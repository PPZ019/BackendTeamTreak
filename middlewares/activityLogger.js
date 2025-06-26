const fs = require("fs");
const path = require("path");

const activityLogger = (action) => {
  return (req, res, next) => {
    const log = {
      time: new Date().toISOString(),
      user: req.user?.email || "Guest",
      action,
      ip: req.ip,
      path: req.originalUrl,
    };
    fs.appendFileSync(
      path.join(__dirname, "../logs/activity.log"),
      JSON.stringify(log) + "\n"
    );
    next();
  };
};

module.exports = activityLogger;
