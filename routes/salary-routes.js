const express = require("express");
const {setupSalary, viewSalary} = require("../controllers/salary-controller");

const router = express.Router();

router.post("/setup", setupSalary);
router.get("/view/:employeeId", viewSalary);

module.exports = router;
