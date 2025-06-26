const router = require('express').Router();
const asyncMiddleware = require('../middlewares/async-middleware');
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const upload = require('../configs/cloudinaryConfigure');
const activityLogger = require("../middlewares/activityLogger");


console.log(upload)
router.patch('/user',upload.single('profile'),asyncMiddleware(userController.updateUser));  // Update Self Account
router.get('/team/:id',asyncMiddleware(teamController.getTeam));
router.get('/team/:id/members',asyncMiddleware(teamController.getTeamMembers)); 
router.post('/mark-employee-attendance',asyncMiddleware(userController.markEmployeeAttendance));
router.post('/view-employee-attendance',asyncMiddleware(userController.viewEmployeeAttendance));
router.post('/apply-leave-application',asyncMiddleware(userController.applyLeaveApplication));
router.post('/view-leave-applications',activityLogger("View Attendance"), asyncMiddleware(userController.viewLeaveApplications));
router.post('/view-salary',asyncMiddleware(userController.viewSalary));

module.exports = router;