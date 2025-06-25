class ErrorHandler extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  
    static badRequest(message = 'Bad Request') {
      return new ErrorHandler(400, message);
    }
  
    static unauthorized(message = 'Unauthorized') {
      return new ErrorHandler(401, message);
    }
  
    static notFound(message = 'Not Found') {
      return new ErrorHandler(404, message);
    }
  
    static internal(message = 'Internal Server Error') {
      return new ErrorHandler(500, message);
    }
  }
  
  module.exports = ErrorHandler;