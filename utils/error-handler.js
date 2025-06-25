// class ErrorHandler extends Error{

//     constructor(message,statusCode)
//     {
//         super(message);
//         this.statusCode = statusCode;
//         Error.captureStackTrace(this,this.constructor)
//     }


//     static serverError = (message='Something Went Wrong') =>
//     {
//        return new ErrorHandler(message,500);
//     }


//     static badRequest = (message='Bad Request') =>
//     {
//        return new ErrorHandler(message,400);
//     }

//     static notFound = (message='Resourse Not Found') =>
//     {
//         return new ErrorHandler(message,404);
//     }

//     static unAuthorized = (message='Unauthorized Access')=>
//     {
//         return new ErrorHandler(message,401);
//     }
    
//     static notAllowed = (message='Not Allowed')=>
//     {
//         return new ErrorHandler(message,403);
//     }


// }

// module.exports = ErrorHandler;

module.exports = (err, req, res, next) => {
    console.error('💥', err);
  
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
  
    if (res.headersSent) {
      return next(err);
    }
  
    res.status(status).json({
      success: false,
      message,
    });
  };
// /utils/error-handler.js

class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      Error.captureStackTrace(this, this.constructor);
    }
  
    static badRequest(message = 'Bad Request') {
      return new ErrorHandler(message, 400);
    }
  
    static unauthorized(message = 'Unauthorized Access') {
      return new ErrorHandler(message, 401);
    }
  
    static notFound(message = 'Resource Not Found') {
      return new ErrorHandler(message, 404);
    }
  
    static serverError(message = 'Something Went Wrong') {
      return new ErrorHandler(message, 500);
    }
  
    static notAllowed(message = 'Not Allowed') {
      return new ErrorHandler(message, 403);
    }
  }
  
  module.exports = ErrorHandler;
  
  
  