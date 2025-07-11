require('dotenv').config();
const express = require('express');
const PORT = process.env.PORT || 5500;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dbConnection = require('./configs/db-config');
const authRoute = require('./routes/auth-route');
const invoiceRoutes = require('./routes/invoiceRoutes');
const adminRoute = require('./routes/admin-route');
const employeeRoute = require('./routes/employee-route');
const leaderRoute = require('./routes/leader-route');
const chatRoute = require('./routes/chat-route');
const companyRoutes = require('./routes/company-routes'); 
const holidayRoutes = require('./routes/holiday-routes'); 
const salaryRoutes = require('./routes/salary-routes'); 
const expenseClaimRoutes = require('./routes/claimRoutes');
const errorMiddleware = require('./middlewares/error-middleware');
const ErrorHandler = require('./utils/error-handler');
const { auth, authRole } = require('./middlewares/auth-middleware');
const announcementRoutes = require('./routes/announcementRoutes');
const roleRoutes = require('./routes/RoleRoutes');
const performanceRoute = require('./routes/performance-routes');
const documentRoutes = require('./routes/documentRoutes');
const form16Routes = require('./routes/form16.routes');
const form24qRoutes = require('./routes/form24q.routes');
const itDeclarationRoutes = require('./routes/itDeclaration.routes');


const app = express();

// ✅ Database Connection
dbConnection();

// ✅ Environment URL
const { CLIENT_URL } = process.env;
console.log("Client URL:", CLIENT_URL);

// ✅ CORS Configuration
const corsOption = {
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Allow React + Vite
  credentials: true,
};
app.use(cors(corsOption));

// ✅ Middleware Setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// ✅ Routes
app.use('/api/auth', authRoute);
app.use('/api/admin', auth, authRole(['admin', 'client']), adminRoute);
app.use('/api/employee', auth, authRole(['employee', 'leader']), employeeRoute);
app.use('/api/leader', auth, authRole(['leader']), leaderRoute);
app.use('/api/chat', chatRoute); 
app.use('/api/invoice', invoiceRoutes);
app.use("/api", companyRoutes);
app.use("/api", holidayRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/performance", performanceRoute);
app.use('/api/expense', expenseClaimRoutes);
app.use('/api/form16', form16Routes);
app.use('/api/form24q', form24qRoutes);
app.use('/api/itDeclaration', itDeclarationRoutes);

const path = require('path');




app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Static Files
app.use('/storage', express.static('storage'));

// ✅ 404 Handler
app.use((req, res, next) => {
  return next(ErrorHandler.notFound('The Requested Resource Was Not Found'));
});

// ✅ Error Middleware
app.use(errorMiddleware);

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
