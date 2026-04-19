const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./src/config/db');
const { errorHandler, notFound } = require('./src/middlewares/errorHandler');
// const allApiRoutes = require('./src/routes/index');



dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.get('/', (req, res) => {
  res.send('API is running...');
});

// routes
 app.use("/api/auth" , require("./src/routes/authRoutes"))
app.use("/api/users", require("./src/routes/userRoutes")); 
app.use("/api/rooms", require("./src/routes/roomRoutes"));
app.use("/api/customers", require("./src/routes/customerRoutes"));
app.use("/api/bookings", require("./src/routes/bookingRoutes"));
app.use("/api/invoices", require("./src/routes/invoiceRoutes"));
app.use("/api/maintenances", require("./src/routes/maintenanceRoutes"));
app.use("/api/cleaning-schedules", require("./src/routes/cleaningScheduleRoutes"));
app.use("/api/room-service-requests", require("./src/routes/roomServiceRequestRoutes"));
// app.use("/api/levels", require("./src/routes/levelRoutes")); 
// app.use("/api/tests", require("./src/routes/testRoutes")); 




// error handler
app.use(notFound)
app.use(errorHandler)


// running
const PORT = process.env.PORT;
app.listen(PORT, ()=> console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`))
