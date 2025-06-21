const express = require('express');
const router = express.Router();
const {
  addHoliday,
  getAllHolidays,
} = require("../controllers/holiday-controller");

// Add a holiday
router.post("/holidays", addHoliday);

// Get all holidays
router.get("/holidays", getAllHolidays);

// Get holidays by year
router.get("/holidays/:year", getAllHolidays);

module.exports = router;
