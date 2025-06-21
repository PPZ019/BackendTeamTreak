const Salary = require("../models/salary-model");
const mongoose = require("mongoose");

const setupSalary = async (req, res) => {
    try {
      const { employeeId, basic, hra, allowance, deduction, date } = req.body;
      console.log("Incoming payload:", req.body);
      if (!employeeId || basic === undefined || basic === "" || !date) {
        return res.status(400).json({ message: "Employee ID, Basic Salary, and Date are required" });
      }
  
      const inputDate = new Date(date);
      if (isNaN(inputDate)) {
        return res.status(400).json({ message: "Invalid date format" });
      }
  
      const startOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth(), 1);
      const endOfMonth = new Date(inputDate.getFullYear(), inputDate.getMonth() + 1, 1);
  
      const existingSalary = await Salary.findOne({
        employeeId,
        createdAt: { $gte: startOfMonth, $lt: endOfMonth }
      });
  
      if (existingSalary) {
        return res.status(400).json({ message: "Salary for this employee already exists for this month." });
      }
  
      const newSalary = new Salary({
        employeeId,
        basic,
        hra,
        allowance,
        deduction,
        createdAt: inputDate
      });
  
      await newSalary.save();
  
      res.status(201).json({ message: "Salary slip created successfully", salary: newSalary });
    } catch (error) {
      console.error("Error setting up salary:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };

  const viewSalary = async (req, res) => {
    try {
      const { employeeId } = req.params;
      const { day, month, year } = req.query;
  
      if (!employeeId) {
        return res.status(400).json({ message: "Employee ID is required" });
      }
  
      const query = { employeeId: new mongoose.Types.ObjectId(employeeId) };
  
      let startDate, endDate;
  
      if (day && month && year) {
        // Filter by exact day
        startDate = new Date(year, month - 1, day);
        endDate = new Date(year, month - 1, parseInt(day) + 1);
      } else if (month && year) {
        // Filter by entire month
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 1);
      } else if (year) {
        // Filter by year
        startDate = new Date(year, 0, 1);
        endDate = new Date(parseInt(year) + 1, 0, 1);
      }
  
      if (startDate && endDate) {
        query.createdAt = { $gte: startDate, $lt: endDate };
      }
  
      const salary = await Salary.find(query).sort({ createdAt: -1 });
  
      if (!salary || salary.length === 0) {
        return res.status(404).json({ message: "No salary records found" });
      }
  
      res.json({ success: true, data: salary });
    } catch (error) {
      console.error("Error fetching salary:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  };
  

module.exports = {
  setupSalary,
  viewSalary
};
