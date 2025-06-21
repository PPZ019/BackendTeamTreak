const tokenService  = require('../services/token-service');
const userService   = require('../services/user-service');
const ErrorHandler  = require('../utils/error-handler');
const { TokenExpiredError } = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;
    if (!accessToken) return next(ErrorHandler.unAuthorized());

    /* ─── Verify Access Token ─── */
    let userData = await tokenService.verifyAccessToken(accessToken);

    /* ─── If expired, try refresh flow ─── */
    if (!userData) throw new TokenExpiredError('jwt expired');

    req.user = userData;
    return next();                       // ✅ success – exit here
  } catch (err) {
    /* ─── Handle expired access token ─── */
    if (err instanceof TokenExpiredError) {
      const { refreshToken } = req.cookies;
      if (!refreshToken) return next(ErrorHandler.unAuthorized());

      try {
        const userData = await tokenService.verifyRefreshToken(refreshToken);
        const { _id, email, username, type } = userData;

        const tokenInDB = await tokenService.findRefreshToken(_id, refreshToken);
        if (!tokenInDB) return next(ErrorHandler.unAuthorized());

        /* new tokens */
        const payload = { _id, email, username, type };
        const { accessToken: newAT, refreshToken: newRT } = tokenService.generateToken(payload);
        await tokenService.updateRefreshToken(_id, refreshToken, newRT);

        /* set cookies */
        res.cookie('accessToken', newAT, {
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
        res.cookie('refreshToken', newRT, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });

        const user = await userService.findUser({ email });
        if (user.status !== 'active') return next(ErrorHandler.unAuthorized('Account problem'));

        req.user = user;
        return next();                   // ✅ refreshed – exit
      } catch (refreshErr) {
        return next(ErrorHandler.unAuthorized());
      }
    }
<<<<<<< Updated upstream
    catch(e)
    {
        console.log('Token Error');
        if(e instanceof TokenExpiredError)
        {
            console.log('Trying To Generate New Token');
            if(!refreshTokenFromCookie) return next(ErrorHandler.unAuthorized());
                const userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
                const {_id,email,username,type} = userData;
                const token = await tokenService.findRefreshToken(_id,refreshTokenFromCookie);
                if(!token) return next(ErrorHandler.unAuthorized());
                const payload = {
                    _id,
                    email,
                    username,
                    type
                }
                const {accessToken,refreshToken} = tokenService.generateToken(payload);
                await tokenService.updateRefreshToken(_id,refreshTokenFromCookie,refreshToken);
                const user = await userService.findUser({email});
                if(user.status!='active') return next(ErrorHandler.unAuthorized('There is a problem with your account, Please contact to the admin'));
                req.user = user;
                req.cookies.accessToken = accessToken;
                req.cookies.refreshToken = refreshToken;
                res.cookie('accessToken',accessToken,{
                    maxAge:1000*60*60*24*30,
                    // httpOnly:true
                })
                res.cookie('refreshToken',refreshToken,{
                    maxAge:1000*60*60*24*30,
                    // httpOnly:true
                })
                console.log('Token Generated Success');
                    return next();
            }
        else
            return next(ErrorHandler.unAuthorized());
    }
    next();
}
=======
    /* any other error */
    return next(ErrorHandler.unAuthorized());
  }
};
>>>>>>> Stashed changes

/* ───────────────────────────────────── */

const authRole = (roles = []) => (req, res, next) => {
  // normalise casing for safe compare
  const allowed = roles.map((r) => r.toLowerCase());
  const userRole = (req.user?.type || '').toLowerCase();

  if (!allowed.includes(userRole))
    return next(ErrorHandler.notAllowed()); // 403

  next();
};

module.exports = { auth, authRole };
