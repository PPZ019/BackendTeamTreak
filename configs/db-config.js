const mongoose = require('mongoose');
require('dotenv').config();
const UserController = require('../controllers/user-controller');

const { MONGO_URI } = process.env;

const dbConnection = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("❌ MONGO_URI not found in .env file");
    }

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Database Connection Successful');

    // Optional: ensure index creation if needed
    // await mongoose.connection.db.command({ ping: 1 });

    // Create admin if not exists
    await UserController.createInitialAdmin();

  } catch (err) {
    console.error('❌ Failed To Connect With Database\nReason:', err.message);
    process.exit(1); // exit the process if DB connection fails
  }
};

module.exports = dbConnection;
