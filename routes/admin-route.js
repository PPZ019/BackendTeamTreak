const router = require('express').Router();
const userController = require('../controllers/user-controller');
const teamController = require('../controllers/team-controller');
const upload = require('../services/file-upload-service'); // ✅ updated
const asyncMiddleware = require('../middlewares/async-middleware');

<<<<<<< Updated upstream
router.post('/user',upload.single('profile'),asyncMiddleware(userController.createUser));           // Create User
router.patch('/user/:id',upload.single('profile'),asyncMiddleware(userController.updateUser));      // Update User
router.get('/employees',asyncMiddleware(userController.getUsers));                                  // Employees
router.get('/employees/free',asyncMiddleware(userController.getFreeEmployees));                     // Free Employees
router.get('/employee/:id',asyncMiddleware(userController.getUser));                                // Employee
router.get('/user/:id',asyncMiddleware(userController.getUserNoFilter));                            // User - No Filter (Admin,Leader,Employee)
router.get('/admins',asyncMiddleware(userController.getUsers));                                     // Admins
router.get('/admin/:id',asyncMiddleware(userController.getUser));                                   // Admin
router.get('/leaders/free',asyncMiddleware(userController.getFreeLeaders));                         // Free Leaders
router.get('/leaders',asyncMiddleware(userController.getLeaders));                                  // Leaders
router.get('/leader/:id',asyncMiddleware(userController.getUser));                                  // Leader
router.post('/team',upload.single('image'),asyncMiddleware(teamController.createTeam));             // Create Team
router.patch('/team/:id',upload.single('image'),asyncMiddleware(teamController.updateTeam));        // Update Team
router.get('/teams',asyncMiddleware(teamController.getTeams));                                      // Teams
router.get('/team/:id',asyncMiddleware(teamController.getTeam));                                    // Team
router.get('/team/:id/members',asyncMiddleware(teamController.getTeamMembers));                     // Team Members
router.patch('/team/member/add',asyncMiddleware(teamController.addMember));                         // Add Team Member
router.patch('/team/member/remove',asyncMiddleware(teamController.removeMember));                   // Remove Team Member
router.patch('/team/leader/add',asyncMiddleware(teamController.addRemoveLeader));                   // Add Team Leader
router.patch('/team/leader/remove',asyncMiddleware(teamController.addRemoveLeader));                // Remove Team Leader
router.get('/counts',asyncMiddleware(teamController.getCounts));                                    // Counts
router.post('/view-employee-attendance',asyncMiddleware(userController.viewEmployeeAttendance));
router.post('/view-leave-applications',asyncMiddleware(userController.viewLeaveApplications));
router.post('/assign-employee-salary',asyncMiddleware(userController.assignEmployeeSalary));
router.post('/update-employee-salary/',asyncMiddleware(userController.updateEmployeeSalary));
router.post('/view-all-salary',asyncMiddleware(userController.viewSalary));
router.post('/update-leave/:id',asyncMiddleware(userController.updateLeaveApplication));
=======
// User Routes
router.get('/create-initial-admin', userController.createInitialAdmin);
router.post('/user', upload.single('profile'), asyncMiddleware(userController.createUser)); // ✅ updated: field is 'image'
router.patch('/user/:id', upload.single('profile'), asyncMiddleware(userController.updateUser));
>>>>>>> Stashed changes

// View & Manage Users
router.get('/employees', asyncMiddleware(userController.getUsers));
router.get('/employees/free', asyncMiddleware(userController.getFreeEmployees));
router.get('/employee/:id', asyncMiddleware(userController.getUser));
router.get('/user/:id', asyncMiddleware(userController.getUserNoFilter));
router.get('/admins', asyncMiddleware(userController.getUsers));
router.get('/admin/:id', asyncMiddleware(userController.getUser));
router.get('/leaders/free', asyncMiddleware(userController.getFreeLeaders));
router.get('/leaders', asyncMiddleware(userController.getLeaders));
router.get('/leader/:id', asyncMiddleware(userController.getUser));

// Team Routes
router.post('/team', upload.single('profile'), asyncMiddleware(teamController.createTeam));
router.patch('/team/:id', upload.single('profile'), asyncMiddleware(teamController.updateTeam));
router.get('/teams', asyncMiddleware(teamController.getTeams));
router.get('/team/:id', asyncMiddleware(teamController.getTeam));
router.get('/team/:id/members', asyncMiddleware(teamController.getTeamMembers));
router.patch('/team/member/add', asyncMiddleware(teamController.addMember));
router.patch('/team/member/remove', asyncMiddleware(teamController.removeMember));
router.patch('/team/leader/add', asyncMiddleware(teamController.addRemoveLeader));
router.patch('/team/leader/remove', asyncMiddleware(teamController.addRemoveLeader));

// Attendance/Leave/Salary
router.get('/counts', asyncMiddleware(teamController.getCounts));
router.post('/view-employee-attendance', asyncMiddleware(userController.viewEmployeeAttendance));
router.post('/view-leave-applications', asyncMiddleware(userController.viewLeaveApplications));
router.post('/assign-employee-salary', asyncMiddleware(userController.assignEmployeeSalary));
router.post('/update-employee-salary', asyncMiddleware(userController.updateEmployeeSalary));
router.post('/view-all-salary', asyncMiddleware(userController.viewSalary));
router.post('/update-leave/:id', asyncMiddleware(userController.updateLeaveApplication));

module.exports = router;
