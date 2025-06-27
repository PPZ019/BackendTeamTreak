const express = require("express");
const router = express.Router();
const controller = require("../controllers/itDeclarationController");
const { auth, authRole } = require("../middlewares/auth-middleware");

router.post("/", auth, controller.submitDeclaration);
router.get("/me", auth, authRole(["employee"]), controller.getMyDeclarations);

router.get("/", auth, authRole(["admin", "client"]), controller.getAllDeclarations);
router.post("/approve/:id", auth, authRole(["admin", "client"]), controller.approveDeclaration);
router.post("/reject/:id", auth, authRole(["admin", "client"]), controller.rejectDeclaration);

module.exports = router;
