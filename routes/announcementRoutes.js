const express = require("express");
const router = express.Router();
const controller = require("../controllers/announcementController");
const {auth} = require("../middlewares/auth-middleware")

router.post("/create",auth, controller.createAnnouncement);
router.get("/all",auth, controller.getAllAnnouncements);
router.delete("/delete/:id",auth, controller.deleteAnnouncement);

module.exports = router;