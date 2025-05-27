const express = require("express");
const dotEnv = require("dotenv");
const connectDB = require("./config/db");
const studentRoutes = require("./routes/studentRoute"); 

// to read env files
dotEnv.config();

//initialise express app
const app = express();

// connect to DB
connectDB();

//middleware
app.use(express.json());

//routes
app.use("/api/students",studentRoutes);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
    console.log(`Student Service is running on port ${PORT}`);
});
