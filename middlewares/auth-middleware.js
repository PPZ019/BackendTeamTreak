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
      return next(ErrorHandler.unauthorized());
    }

    const userData = await tokenService.verifyAccessToken(accessTokenFromCookie);
    if (!userData) {
      console.log("Invalid access token");
      return next(ErrorHandler.unauthorized());
    }

    const user = await userService.findUser({ _id: userData._id }).populate("company");
    if (!user || user.status !== 'active') {
      return next(ErrorHandler.unauthorized('There is a problem with your account, Please contact to the admin'));
    }

    req.user = {
      _id: user._id,
      email: user.email,
      username: user.username,
      type: user.type,
      company: user.company ? user.company._id || user.company : undefined,
    };
    console.log("Authenticated:", req.user);
    return next();
  } catch (e) {
    console.log("Token error:", e.message);

    if (e instanceof TokenExpiredError) {
      console.log("Trying to refresh token");

      if (!refreshTokenFromCookie) return next(ErrorHandler.unauthorized());

      try {
        const userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
        const { _id } = userData;

        const token = await tokenService.findRefreshToken(_id, refreshTokenFromCookie);
        if (!token) return next(ErrorHandler.unauthorized());

        const fullUser = await userService.findUser({ _id }).populate("company", "name");
        if (!fullUser || fullUser.status !== 'active') {
          return next(ErrorHandler.unauthorized('There is a problem with your account, Please contact to the admin'));
        }

        const payload = {
          _id: fullUser._id,
          email: fullUser.email,
          username: fullUser.username,
          type: fullUser.type,
        };

        const { accessToken, refreshToken } = tokenService.generateToken(payload);

        await tokenService.updateRefreshToken(_id, refreshTokenFromCookie, refreshToken);

        req.user = {
          _id: fullUser._id,
          email: fullUser.email,
          username: fullUser.username,
          type: fullUser.type,
          company: fullUser.company ? fullUser.company._id || fullUser.company : undefined,
        };

        res.cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: "lax",
        });

        res.cookie("refreshToken", refreshToken, {
          maxAge: 1000 * 60 * 60 * 24 * 30,
          secure: process.env.NODE_ENV === 'production',
          sameSite: "lax",
        });

        console.log("Refreshed token, user authenticated:", req.user);
        return next();
      } catch (refreshErr) {
        console.log("Refresh token error:", refreshErr.message);
        return next(ErrorHandler.unauthorized());
      }
    }

    console.log("Final auth failure");
    return next(ErrorHandler.unauthorized());
  }
};

const authRole = (roles = []) => {
  return (req, res, next) => {
    const allowed = roles.map((r) => r.toLowerCase());
    const userRole = (req.user?.type || '').toLowerCase();

    console.log("🔒 Role check:", { userRole, allowed });

    if (!allowed.includes(userRole)) {
      return next(ErrorHandler.notAllowed());
    }
    next();
  };
};


module.exports = {
  auth,
  authRole,
};