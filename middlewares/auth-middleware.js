const tokenService = require('../services/token-service');
const userService = require('../services/user-service');
const ErrorHandler = require('../utils/error-handler');
const { TokenExpiredError } = require('jsonwebtoken');

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
      return next(ErrorHandler.unAuthorized());
    }

    // ✅ Fetch full user with company populated
    const user = await userService.findUser({ _id: userData._id }).populate("company", "name");
    if (!user) return next(ErrorHandler.unAuthorized());

    req.user = user;
    console.log("✅ Authenticated:", req.user);
    return next();
  } catch (e) {
    console.log("⚠️ Token error:", e.message);

    if (e instanceof TokenExpiredError) {
      console.log("🔁 Trying to refresh token");

      if (!refreshTokenFromCookie) return next(ErrorHandler.unAuthorized());

      const userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
      const { _id } = userData;

      const token = await tokenService.findRefreshToken(_id, refreshTokenFromCookie);
      if (!token) return next(ErrorHandler.unAuthorized());

      // ✅ Fetch full user again with company populated
      const fullUser = await userService.findUser({ _id }).populate("company", "name");
      if (!fullUser || fullUser.status !== 'active') {
        return next(ErrorHandler.unAuthorized("There is a problem with your account"));
      }

      const payload = {
        _id: fullUser._id,
        email: fullUser.email,
        username: fullUser.username,
        type: fullUser.type,
      };

      const { accessToken, refreshToken } = tokenService.generateToken(payload);

      await tokenService.updateRefreshToken(_id, refreshTokenFromCookie, refreshToken);

      req.user = fullUser;

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

const authRole = (role) => {
  return (req, res, next) => {
    if (!role.includes(req.user.type)) {
      return next(ErrorHandler.notAllowed());
    }
    next();
  };
};

module.exports = {
  auth,
  authRole,
};
