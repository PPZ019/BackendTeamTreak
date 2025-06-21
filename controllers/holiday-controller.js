const Holiday = require("../models/Holiday");


const addHoliday = async (req, res) => {
  const { date, title, type } = req.body;
  try {
    const newHoliday = new Holiday({ date, title, type });
    await newHoliday.save();
    res.status(201).json(newHoliday);
  } catch (error) {
    res.status(400).json({ message: "Error adding holiday", error });
  }
};

const getAllHolidays = async (req, res) => {
  const { year } = req.params;

  try {
    let holidays;

    if (year) {
      const start = new Date(`${year}-01-01`);
      const end = new Date(`${parseInt(year) + 1}-01-01`);
      holidays = await Holiday.find({
        date: { $gte: start, $lt: end },
      }).sort({ date: 1 });
    } else {
      holidays = await Holiday.find().sort({ date: 1 });
    }

    res.status(200).json(holidays);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch holidays", error });
  }
};

module.exports = {
  addHoliday,
  getAllHolidays,
};
