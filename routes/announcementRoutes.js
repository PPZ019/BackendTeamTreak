const express = require("express");
const router = express.Router();
const controller = require("../controllers/announcementController");

router.post("/create", controller.createAnnouncement);
router.get("/all", controller.getAllAnnouncements);
router.delete("/delete/:id", controller.deleteAnnouncement);

module.exports = router;