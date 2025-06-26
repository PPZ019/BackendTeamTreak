const ErrorHandler = require('../utils/error-handler');
const userService = require('../services/user-service');
const UserDto = require('../dtos/user-dto');
const mongoose = require('mongoose');
const teamService = require('../services/team-service');
const attendanceService = require('../services/attendance-service');
const crypto = require('crypto');
const User = require('../models/user-model');

class UserController {
    createInitialAdmin = async (req, res, next) => {
        const existing = await userService.findUser({ email: 'admin@example.com' });
        if (existing) {
            console.log('✅ Admin already exists');
            return;
        }
    
        const username = 'admin' + crypto.randomInt(11111111, 999999999);
        const password = await userService.hashPassword('admin123');
    
        const user = {
            name: 'Super Admin',
            email: 'admin@example.com',
            username,
            password,
            type: 'admin',
            address: 'Default HQ',
            mobile: '9999999999',
            image: 'default.png',
        };
    
        const userResp = await userService.createUser(user);
        if (userResp) {
            console.log('✅ Initial Admin Created');
        } else {
            console.log('❌ Failed to create initial admin');
        }
    };

    createUser = async (req, res, next) => {
        try {
          const file = req.file;
          let { name, email, password, type, address, mobile, adminPassword, company } = req.body;
          const username = 'user' + crypto.randomInt(11111111, 999999999);
      
          // 1. Validations
          if (!file || !file.path) return next(ErrorHandler.badRequest('Profile image is required'));
          if (!name || !email || !password || !type || !address || !mobile)
            return next(ErrorHandler.badRequest('All fields are required'));
      
          // 2. Normalize type
          type = type.trim().toLowerCase();
          const allowedTypes = ['admin', 'employee', 'leader', 'client'];

          if (!allowedTypes.includes(type)) return next(ErrorHandler.badRequest('Invalid user type'));
      
          // 3. Duplicate check
          const duplicate = await userService.findUser({
            $or: [{ email: email.toLowerCase() }, { username }]
          });
          if (duplicate) return next(ErrorHandler.badRequest('Email or username already exists'));
      
          // 4. Admin verification
          if (type === 'Admin') {
            if (!adminPassword) return next(ErrorHandler.badRequest('Admin password required'));
            const requester = await userService.findUser({ _id: req.user._id }).select('+password');
            if (!requester) return next(ErrorHandler.unAuthorized('Requester not found'));
      
            const validPw = await userService.verifyPassword(adminPassword, requester.password);
            if (!validPw) return next(ErrorHandler.unAuthorized('Wrong admin password'));
          }
      
          // 5. Image
          const imageUrl = file.path;
      
          // 6. Payload
          const payload = {
            name,
            email: email.toLowerCase(),
            username,
            password,
            mobile,
            address,
            type,
            image: imageUrl,
            company: req.user.type === 'Admin' ? company : req.user.company,
          };
      
          // 7. Save user
          const user = await userService.createUser(payload);
          if (!user) return next(ErrorHandler.serverError('User creation failed'));
      
          // 8. Success
          return res.status(201).json({
            success: true,
            message: 'User created',
            data: new UserDto(user),
          });
        } catch (err) {
          console.error('🔥 createUser error:', err);
          return next(ErrorHandler.serverError(err.message));
        }
      };
      

    updateUser = async (req, res, next) => {
        const file = req.file;
        const filename = file && file.filename;
        let user, id;
        console.log(req.user.type);
        if (req.user.type === 'admin') {
            const { id } = req.params;
            let { name, username, email, password, type, status, address, mobile } = req.body;
            type = type && type.toLowerCase();
            if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid User Id'));
            if (type) {
                const dbUser = await userService.findUser({ _id: id });
                if (!dbUser) return next(ErrorHandler.badRequest('No User Found'));
                if (dbUser.type != type) {
                    const { _id } = req.user;
                    if (_id === id) return next(ErrorHandler.badRequest(`You Can't Change Your Own Position`));
                    const { adminPassword } = req.body;
                    if (!adminPassword)
                        return next(ErrorHandler.badRequest(`Please Enter Your Password To Change The Type`));
                    const { password: hashPassword } = await userService.findUser({ _id });
                    const isPasswordValid = await userService.verifyPassword(adminPassword, hashPassword);
                    if (!isPasswordValid) return next(ErrorHandler.unAuthorized('You have entered a wrong password'));

                    if ((dbUser.type === 'employee') && (type === 'admin' || type === 'leader'))
                        if (dbUser.team != null) return next(ErrorHandler.badRequest(`Error : ${dbUser.name} is in a team.`));

                    if ((dbUser.type === 'leader') && (type === 'admin' || type === 'employee'))
                        if (await teamService.findTeam({ leader: id })) return next(ErrorHandler.badRequest(`Error : ${dbUser.name} is leading a team.`));
                }
            }
            user = {
                name, email, status, username, mobile, password, type, address, image: filename
            }
        }
        else {
            id = req.user._id;
            let { name, username, address, mobile } = req.body;
            user = {
                name, username, mobile, address, image: filename
            }
        }
        const userResp = await userService.updateUser(id, user);
        if (!userResp) return next(ErrorHandler.serverError('Failed To Update Account'));
        res.json({ success: true, message: 'Account Updated' });
    }

    getUsers = async (req, res) => {
        try {
            const { type, company } = req.user;

            const filter = { type: "employee" };

            // If client, restrict to same company
            if (type === "client") {
                if (!company) {
                    return res.status(403).json({ success: false, message: "Company not assigned" });
                }
                filter.company = company;
            }

            const employees = await User.find(filter)
                .populate("company", "name") // optional: populate company name
                .select("-password"); // don't send password

            res.json({ success: true, employees });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    getFreeEmployees = async (req, res, next) => {
        const emps = await userService.findUsers({ type: 'employee', team: null });
        if (!emps || emps.length < 1) return next(ErrorHandler.notFound(`No Free Employee Found`));
        const employees = emps.map((o) => new UserDto(o));
        res.json({ success: true, message: 'Free Employees List Found', data: employees })
    }

    getUser = async (req, res, next) => {
        const { id } = req.params;
        const type = req.path.replace(id, '').replace('/', '').replace('/', '');
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest(`Invalid ${type.charAt(0).toUpperCase() + type.slice(1).replace(' ', '')} Id`));
        const emp = await userService.findUser({ _id: id, type });
        if (!emp) return next(ErrorHandler.notFound(`No ${type.charAt(0).toUpperCase() + type.slice(1).replace(' ', '')} Found`));
        res.json({ success: true, message: 'Employee Found', data: new UserDto(emp) })
    }

    getUserNoFilter = async (req, res, next) => {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return next(ErrorHandler.badRequest('Invalid User Id'));
        const emp = await userService.findUser({ _id: id });
        if (!emp) return next(ErrorHandler.notFound('No User Found'));
        res.json({ success: true, message: 'User Found', data: new UserDto(emp) })
    }

    getLeaders = async (req, res, next) => {
        try {
            const { type } = req.user;

            let filter = { type: "client" }; // because client == leader

            // If user is NOT admin, filter by company
            if (type !== "admin") {
                if (!req.user.company) {
                    return res.status(403).json({ success: false, message: "Company not assigned." });
                }
                filter.company = req.user.company;
            }

            const leaders = await userService.findLeaders(filter); // aggregation me team & company join ho rha hai
            const data = leaders.map((u) => new UserDto(u));

            res.json({ success: true, message: "Leaders Found", data });
        } catch (err) {
            console.error("getLeaders Error:", err);
            res.status(500).json({ success: false, message: "Server error." });
        }
    };

    getFreeLeaders = async (req, res, next) => {
        const leaders = await userService.findFreeLeaders();
        const data = leaders.map((o) => new UserDto(o));
        res.json({ success: true, message: 'Free Leaders Found', data })
    }

     markEmployeeAttendance = async (req, res, next) => {
        try {
          const { _id: employeeID, company } = req.user;
          const { ip, location } = req.body;
      
          const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
          const d = new Date();
      
          const newAttendance = {
            employeeID,
            company,
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            date: d.getDate(),
            day: days[d.getDay()],
            present: true,
            ip,
            location,
          };
      
          const isMarked = await attendanceService.findAttendance({
            employeeID,
            year: newAttendance.year,
            month: newAttendance.month,
            date: newAttendance.date,
          });
      
          if (isMarked) {
            return next(ErrorHandler.notAllowed("Attendance already marked today."));
          }
      
          const result = await attendanceService.markAttendance(newAttendance);
          if (!result) return next(ErrorHandler.serverError("Attendance marking failed."));
      
          res.json({ success: true, newAttendance, message: "Attendance Marked!" });
        } catch (err) {
          console.error("Mark Attendance Error:", err);
          res.status(500).json({ success: false, error: err.message });
        }
      };

      viewEmployeeAttendance = async (req, res, next) => {
        try {
          const { type, company, _id: loggedInUserID } = req.user;
          const filter = { ...req.body };
      
          // ✅ Force employeeID if user is employee
          if (type === "employee") {
            filter.employeeID = loggedInUserID;
          }
      
          // ✅ If client, restrict by company
          if (type === "client") {
            if (!company) {
              return res.status(403).json({ success: false, message: "Company not assigned" });
            }
            filter.company = company;
          }
      
          const attendanceRecords = await attendanceService.findAllAttendance(filter);
      
          if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ success: false, message: "No attendance records found." });
          }
      
          res.json({ success: true, data: attendanceRecords });
        } catch (error) {
          console.error("Attendance Fetch Error:", error);
          res.status(500).json({ success: false, message: error.message });
        }
      };
      

      viewLeaveApplications = async (req, res, next) => {
        try {
          const user = req.user;
          if (!user || !user._id) {
            return next(ErrorHandler.unauthorized("Unauthorized access"));
          }
      
          const filters = {};
      
          // ✅ If admin, show all leaves in the company
          if (user.type === 'admin' && user.company) {
            filters.company = new mongoose.Types.ObjectId(user.company);
      
            // Optional frontend filters
            if (req.body.applicantID) filters.applicantID = new mongoose.Types.ObjectId(req.body.applicantID);
          } else {
            // ✅ If not admin, show only their own leave
            filters.applicantID = new mongoose.Types.ObjectId(user._id);
          }
      
          if (req.body.type) filters.type = req.body.type;
          if (req.body.appliedDate) filters.appliedDate = req.body.appliedDate;
          if (req.body.adminResponse) filters.adminResponse = req.body.adminResponse;
      
          console.log("Leave filters:", filters);
      
          const resp = await userService.findAllLeaveApplications(filters);
      
          res.json({ success: true, data: resp || [] });
        } catch (error) {
          console.error("Leave fetch error:", error);
          res.status(500).json({
            success: false,
            message: error.message || "Server Error",
          });
        }
      };

      viewCompanyLeaveApplications = async (req, res, next) => {
        try {
          const user = req.user;
      
          if (!user || !user._id || !user.company)
            return next(ErrorHandler.unauthorized("Unauthorized access"));
      
          // ✅ Only allow for type 'client'
          if (user.type !== 'client') {
            return next(ErrorHandler.forbidden("Only clients can access this route"));
          }
      
          const filters = {
            company: new mongoose.Types.ObjectId(user.company),
          };
      
          // Optional filters
          if (req.body.applicantID) filters.applicantID = new mongoose.Types.ObjectId(req.body.applicantID);
          if (req.body.type) filters.type = req.body.type;
          if (req.body.appliedDate) filters.appliedDate = req.body.appliedDate;
          if (req.body.adminResponse) filters.adminResponse = req.body.adminResponse;
      
          const leaveApplications = await userService.findAllLeaveApplications(filters);
      
          res.json({
            success: true,
            data: leaveApplications || [],
          });
        } catch (error) {
          console.error("Company leave fetch error:", error);
          res.status(500).json({
            success: false,
            message: error.message || "Server Error",
          });
        }
      };
      

    applyLeaveApplication = async (req, res, next) => {
        try {
            const data = req.body;
            const { title, type, startDate, endDate, appliedDate, period, reason } = data;
            const applicantID = req.user._id;
            const user = req.user;

            if (!user || !user.company) {
                return next(ErrorHandler.notAllowed("Company not assigned to user"));
            }

            const newLeaveApplication = {
                applicantID,
                title,
                type,
                startDate,
                endDate,
                appliedDate,
                period,
                reason,
                company: user.company, // associate leave with user's company
                adminResponse: "Pending",
            };

            const isLeaveApplied = await userService.findLeaveApplication({ applicantID, startDate, endDate, appliedDate });
            if (isLeaveApplied) return next(ErrorHandler.notAllowed("Leave Already Applied"));

            const resp = await userService.createLeaveApplication(newLeaveApplication);
            if (!resp) return next(ErrorHandler.serverError("Failed to apply leave"));

            res.json({ success: true, data: resp });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message || "Server error" });
        }
    };

    viewLeaveApplications = async (req, res, next) => {
        try {
            const filters = req.body || {};
            const user = req.user;

            if (!user) return next(ErrorHandler.unauthorized("Unauthorized access"));

            filters.applicantID = user._id; 

            const resp = await userService.findAllLeaveApplications(filters);
            if (!resp || resp.length === 0) return next(ErrorHandler.notFound('No Leave Applications found'));

            res.json({ success: true, data: resp });

        } catch (error) {
            res.status(500).json({ success: false, message: error.message || "Server Error" });
        }
    };

    updateLeaveApplication = async (req, res, next) => {
        try {
            const {id} = req.params;
            const body = req.body;
            const isLeaveUpdated = await userService.updateLeaveApplication(id,body);
            if(!isLeaveUpdated) return next(ErrorHandler.serverError('Failed to update leave'));
            res.json({success:true,message:'Leave Updated'});
        } catch (error) {
            res.json({success:false,error});
        }
    }

    assignEmployeeSalary = async (req, res, next) => {
        try {
            const data = req.body;
            const obj = {
                "employeeID":data.employeeID
            }
            const isSalaryAssigned = await userService.findSalary(obj);
            if(isSalaryAssigned) return next(ErrorHandler.serverError('Salary already assigned'));

            const d = new Date();
            data["assignedDate"] = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
            const resp = await userService.assignSalary(data);
            if(!resp) return next(ErrorHandler.serverError('Failed to assign salary'));
            res.json({success:true,data:resp}); 
        } catch (error) {
            res.json({success:false,error});
        }
    }

    updateEmployeeSalary = async (req,res,next) => {
        try {
            const body = req.body;
            const {employeeID} = body;
            const d = new Date();
            body["assignedDate"] = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();
            const isSalaryUpdated = await userService.updateSalary({employeeID},body);
            console.log(isSalaryUpdated);
            if(!isSalaryUpdated) return next(ErrorHandler.serverError('Failed to update salary'));
            res.json({success:true,message:'Salary Updated'});
        } catch (error) {
            res.json({success:false,error});
        }
    }
}

module.exports = new UserController();