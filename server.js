<<<<<<< Updated upstream
require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 5500;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const dbConnection = require('./configs/db-config');
const authRoute = require('./routes/auth-route');
const adminRoute = require('./routes/admin-route');
const employeeRoute = require('./routes/employee-route');
const leaderRoute = require('./routes/leader-route');
const errorMiddleware = require('./middlewares/error-middleware');
const ErrorHandler = require('./utils/error-handler');
const {auth, authRole} = require('./middlewares/auth-middleware');
const app = express();

// Database Connection
dbConnection();

const {CLIENT_URL} = process.env;
console.log(CLIENT_URL);

//Cors Option
const corsOption = {
    credentials:true,
    origin:['http://localhost:3000','http://1.1.1.111:3000', CLIENT_URL]
}

//Configuration
app.use(cors(corsOption));
app.use(express.urlencoded({ extended: true }));
=======

require('dotenv').config();           

const express        = require('express');
const cors           = require('cors');
const cookieParser   = require('cookie-parser');
const helmet         = require('helmet');
const morgan         = require('morgan');
const rateLimit      = require('express-rate-limit');
const path           = require('path');

const dbConnection   = require('./configs/db-config');
const errorMiddleware= require('./middlewares/error-middleware');
const ErrorHandler   = require('./utils/error-handler');
const { auth, authRole } = require('./middlewares/auth-middleware');

/* ─── Routes ─── */
const authRoute      = require('./routes/auth-route');
const invoiceRoutes  = require('./routes/invoiceRoutes');
const adminRoute     = require('./routes/admin-route');
const employeeRoute  = require('./routes/employee-route');
const leaderRoute    = require('./routes/leader-route');
const chatRoute      = require('./routes/chat-route');
const userRoute=require('./routes/userRoute')

const app  = express();
const PORT = process.env.PORT || 5500;


dbConnection();   


app.use(helmet());                                // security headers
app.use(morgan('dev'));                           // request logger
>>>>>>> Stashed changes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

<<<<<<< Updated upstream
// Routes
app.use('/api/auth',authRoute);
app.use('/api/admin',auth,authRole(['admin']),adminRoute);
app.use('/api/employee',auth,authRole(['employee','leader']),employeeRoute);
app.use('/api/leader',auth,authRole(['leader']),leaderRoute);


app.use('/storage',express.static('storage'))

//Middlewares;
app.use((req,res,next)=>
{
    return next(ErrorHandler.notFound('The Requested Resources Not Found'));
});

app.use(errorMiddleware)





app.listen(PORT,()=>console.log(`Listening On Port : ${PORT}`));
=======
app.use(
  '/api/',
  rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 min
    max: 300,                  // 300 req per IP
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const { CLIENT_URL = '' } = process.env;
const allowedOrigins = CLIENT_URL.split(',').map(s => s.trim()); // env:  http://localhost:3000,http://localhost:5173
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use('/api/auth',        authRoute);
app.use('/api/invoice',     invoiceRoutes);
app.use('/api/chat',        chatRoute);

app.use('/api/admin',       auth, authRole(['Admin']),    adminRoute);
app.use('/api/employee',    auth, authRole(['Employee','Leader']), employeeRoute);
app.use('/api/leader',      auth, authRole(['Leader']),   leaderRoute);
app.use('/api/user',      auth, authRole(['Admin']),    userRoute); // example


app.use('/storage', express.static(path.join(__dirname, 'storage')));


app.use((req, res, next) =>
  next(ErrorHandler.notFound('The requested resource was not found'))
);
app.use(errorMiddleware);

/* ─────────────────────────────
 * 6. Start Server
 * ────────────────────────────*/
const server = app.listen(PORT, () =>
  console.log(`🚀  Server running on http://localhost:${PORT}`)
);

/* ─────────────────────────────
 * 7. Graceful Shutdown
 * ────────────────────────────*/
process.on('unhandledRejection', err => {
  console.error('💥  Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
process.on('SIGTERM', () => {
  console.log('👋  SIGTERM received. Shutting down gracefully.');
  server.close();
});
>>>>>>> Stashed changes
