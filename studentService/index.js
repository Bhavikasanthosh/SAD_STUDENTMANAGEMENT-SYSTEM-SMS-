const express = require("express");
const dotEnv = require("dotenv");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoute"); 
const { correlationIdMiddleware } = require("../correlationId");

// to read env files
dotEnv.config();

//initialise express app
const app = express();

// connect to DB
connectDB();

//middleware
app.use(express.json());
app.use(correlationIdMiddleware); // Middleware to handle correlation IDs

//routes
app.use("/api/students",studentRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(`Student Service is running on port ${PORT}`);
});
