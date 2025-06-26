const UserModel = require('../models/user-model');
const LeaveModel = require('../models/leave-model');
const UserSalaryModel = require('../models/user-salary');
const bcrypt = require('bcrypt');

class UserService {

    hashPassword = async (plainPassword) => {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(plainPassword, salt);
    }
    createUser = async user => await UserModel.create(user);

    updateUser = async (_id,user) => await UserModel.updateOne({_id},user);

    findCount = async filter => await UserModel.find(filter).countDocuments();

    findUser =  filter =>  UserModel.findOne(filter);

    findUsers = async filter => await UserModel.find(filter).populate('team');

    verifyPassword = async (password,hashPassword) => await bcrypt.compare(password,hashPassword);

    resetPassword = async (_id,password) => await UserModel.updateOne({_id},{password});

    updatePassword = async (_id,password) => await UserModel.updateOne({_id},{password});

    findLeaders = async (filter = {}) => {
        return await UserModel.aggregate([
          { $match: filter },
          {
            $lookup: {
              from: "teams",
              localField: "_id",
              foreignField: "leader",
              as: "team"
            }
          },
          {
            $lookup: {
              from: "companies",
              localField: "company",
              foreignField: "_id",
              as: "company"
            }
          },
          {
            $unwind: {
              path: "$company",
              preserveNullAndEmptyArrays: false 
            }
          },
          {
            $project: {
              name: 1,
              email: 1,
              username: 1,
              mobile: 1,
              image: 1,
              type: 1,
              address: 1,
              status: 1,
              team: 1,
              company: { _id: "$company._id", name: "$company.name" }
            }
          }
        ]);
      };
      

      
      findAllLeadersWithCompany = async () => {
        return await UserModel.aggregate([
          {
            $match: { type: "leader" }
          },
          {
            $lookup: {
              from: "companies",               // ✅ collection name in lowercase plural
              localField: "company",           // ✅ field in user document
              foreignField: "_id",             // ✅ field in company document
              as: "company"
            }
          },
          {
            $unwind: {
              path: "$company",
              preserveNullAndEmptyArrays: false // ❌ false => only return users with valid company
            }
          },
          {
            $lookup: {
              from: "teams",
              localField: "_id",
              foreignField: "leader",
              as: "team"
            }
          }
        ]);
      };
      
      
      
      
  
      

    findFreeLeaders = async (req,res,next) =>  await UserModel.aggregate([
    {$match: { "type": 'leader' }},
    {
        $lookup:
        {
            from: "teams",
            localField: "_id",
            foreignField: "leader",
            as: "team"
        }
    },
    {$match: { "team": {$eq:[]} }}
    ])

    createLeaveApplication = async data => LeaveModel.create(data);

    findLeaveApplication = async (data) => LeaveModel.findOne(data);

     findAllLeaveApplications = async (filters = {}) => {
      return await LeaveModel.find(filters)
        .populate('applicantID', 'name email') // ✅ populate only name & email
        .sort({ appliedDate: -1 });
    };
    

    assignSalary = async (data) => UserSalaryModel.create(data);

    findSalary = async (data) => UserSalaryModel.findOne(data);

    findAllSalary = async (data) => UserSalaryModel.find(data);

    updateSalary = async (data, updatedSalary) => UserSalaryModel.findOneAndUpdate(data,updatedSalary);

    updateLeaveApplication = async (id, updatedLeave) => LeaveModel.findByIdAndUpdate(id, updatedLeave);

}


module.exports = new UserService();