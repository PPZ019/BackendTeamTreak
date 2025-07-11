const validator = require('validator');
const bcrypt = require('bcrypt');
const ErrorHandler = require('../utils/error-handler');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');
const otpService = require('../services/otp-service');
const mailService = require('../services/mail-service');

class AuthController {

    login = async (req,res,next) =>
        {
            const {email,password} = req.body;
            if(!email||!password) return next(ErrorHandler.badRequest());
            let data;
            if(validator.isEmail(email))
                data = {email}
            else
                data = {username:email};
            const user = await userService.findUser(data);
            if(!user) return next(ErrorHandler.badRequest('Invalid Email or Username'));
            const {_id,name,username,email:dbEmail,password:hashPassword,type,status} = user;
            if(status!='active') return next(ErrorHandler.badRequest('There is a problem with your account, Please contact to the admin'));
            const isValid = await userService.verifyPassword(password,hashPassword);
            if(!isValid) return next(ErrorHandler.badRequest('Invalid Password'));
            const payload = {
                _id,
                email:dbEmail,
                username,
                type
            }
            const {accessToken,refreshToken} = tokenService.generateToken(payload);
            console.log("Access Token", accessToken);
            console.log("Refresh Token", refreshToken);
            await tokenService.storeRefreshToken(_id,refreshToken);
            res.cookie('accessToken',accessToken,{
                maxAge:1000*60*60*24*30,
                httpOnly:true
            });
            res.cookie('refreshToken',refreshToken,{
                maxAge:1000*60*60*24*30,
                httpOnly:true
            })
    
            console.log(res);
            res.json({success:true,message:'Login Successfull',user:new UserDto(user)})
        }

    forgot = async (req,res,next) =>
    {
        const {email:requestEmail} = req.body;
        if(!requestEmail) return next(ErrorHandler.badRequest());
        if(!validator.isEmail(requestEmail)) return next(ErrorHandler.badRequest('Inavlid Email Address'));
        const user = await userService.findUser({email:requestEmail});
        if(!user) return next(ErrorHandler.notFound('Invalid Email Address'));
        const {_id:userId,name,email} = user;
        const otp = otpService.generateOtp();
        const type = process.env.TYPE_FORGOT_PASSWORD;
        await otpService.removeOtp(userId);
        await otpService.storeOtp(userId,otp,type);
        await mailService.sendForgotPasswordMail(name,email,otp);
        res.json({success:true,message:'Email has been sent to your email address'});
    }

    reset = async (req,res,next) =>
    {
        const {email,otp,password} = req.body;
        if(!email || !otp || !password)  return next(ErrorHandler.badRequest());
        const user = await userService.findUser({email});
        if(!user) return next(ErrorHandler.notFound('No Account Found'));
        const {_id:userId} = user;
        const type = process.env.TYPE_FORGOT_PASSWORD || 2;
        const response = await otpService.verifyOtp(userId,otp,type);
        console.log("Response",response);
        if(response==='INVALID') return next(ErrorHandler.badRequest('Invalid OTP'));
        if(response==='EXPIRED') return next(ErrorHandler.badRequest('Otp has been Expired'));
        const {modifiedCount} = await userService.updatePassword(userId,password);
        return modifiedCount===1 ? res.json({success:true,message:'Password has been reset successfully'}) : next(ErrorHandler.serverError('Failed to Reset your password'));
    }

    logout = async (req,res,next) =>
    {
        const {refreshToken} = req.cookies;
        const {_id} = req.user;
        const response = await tokenService.removeRefreshToken(_id,refreshToken);
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        return (response.modifiedCount===1) ? res.json({success:true,message:'Logout Successfully'}) : next(ErrorHandler.unauthorized());
    }

    refresh = async (req, res, next) => {
        try {
            const { refreshToken: refreshTokenFromCookie } = req.cookies;
    
            if (!refreshTokenFromCookie) {
                console.log('❌ No refresh token in cookies');
                return res.status(401).json({ success: false, message: 'No refresh token found' });
            }
    
            let userData;
            try {
                userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
            } catch (err) {
                console.log('❌ Invalid refresh token', err.message);
                res.clearCookie('refreshToken');
                res.clearCookie('accessToken');
                return res.status(401).json({ success: false, message: 'Invalid refresh token' });
            }
    
            const { _id, email, username, type } = userData;
    
            const token = await tokenService.findRefreshToken(_id, refreshTokenFromCookie);
            if (!token) {
                console.log('❌ Refresh token not found in DB');
                res.clearCookie('refreshToken');
                res.clearCookie('accessToken');
                return res.status(401).json({ success: false, message: 'Unauthorized Access' });
            }
    
            const user = await userService.findUser({ email });
            if (!user || user.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'There is a problem with your account. Please contact admin.',
                });
            }
    
            const payload = { _id, email, username, type };
            const { accessToken, refreshToken } = tokenService.generateToken(payload);
    
            await tokenService.updateRefreshToken(_id, refreshTokenFromCookie, refreshToken);
    
            // Set Cookies
            res.cookie('accessToken', accessToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
    
            res.cookie('refreshToken', refreshToken, {
                maxAge: 1000 * 60 * 60 * 24 * 30,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
    
            console.log('✅ Tokens refreshed');
    
            res.json({
                success: true,
                message: 'Secure access has been granted',
                user: new UserDto(user)
            });
    
        } catch (error) {
            console.error("🔥 Refresh handler crashed:", error.message);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    };
    


}

module.exports = new AuthController();