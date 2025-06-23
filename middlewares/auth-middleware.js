const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const ErrorHandler = require('../utils/error-handler');
const {TokenExpiredError} = require('jsonwebtoken');

const auth = async (req, res, next) => {
    const { accessToken: accessTokenFromCookie, refreshToken: refreshTokenFromCookie } = req.cookies;
    console.log("AccessToken:", accessTokenFromCookie);
    console.log("RefreshToken:", refreshTokenFromCookie);
  
    try {
      if (!accessTokenFromCookie) {
        console.log("❌ No access token in cookie");
        return next(ErrorHandler.unAuthorized());
      }
  
      const userData = await tokenService.verifyAccessToken(accessTokenFromCookie);
      if (!userData) {
        console.log("❌ Invalid access token");
        throw new Error(ErrorHandler.unAuthorized());
      }
  
      req.user = userData;
      console.log("✅ Authenticated:", req.user);
      return next();
    } catch (e) {
      console.log("⚠️ Token error:", e.message);
  
      if (e instanceof TokenExpiredError) {
        console.log("🔁 Trying to refresh token");
  
        if (!refreshTokenFromCookie) return next(ErrorHandler.unAuthorized());
  
        const userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        const { _id, email, username, type } = userData;
  
        const token = await tokenService.findRefreshToken(_id, refreshTokenFromCookie);
        if (!token) return next(ErrorHandler.unAuthorized());
  
        const payload = { _id, email, username, type };
        const { accessToken, refreshToken } = tokenService.generateToken(payload);
  
        await tokenService.updateRefreshToken(_id, refreshTokenFromCookie, refreshToken);
        const user = await userService.findUser({ email });
  
        if (user.status !== 'active')
          return next(ErrorHandler.unAuthorized("There is a problem with your account"));
  
        req.user = user;
        req.cookies.accessToken = accessToken;
        req.cookies.refreshToken = refreshToken;
  
        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        });
  
        res.cookie("refreshToken", refreshToken, {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          // httpOnly: true,
        });
  
        console.log("✅ Refreshed token, user authenticated:", req.user);
        return next();
      }
  
      console.log("❌ Final auth failure");
      return next(ErrorHandler.unAuthorized());
    }
  };
  

const authRole = (role) =>
{
    return (req,res,next)=>
    {
        if(!role.includes(req.user.type))
            return next(ErrorHandler.notAllowed());
        next();
    }
}


module.exports ={
    auth,
    authRole
}