//server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import DBCONNECT from "./config/db.js";
import authRoutes from "./routes/Authentication.js";
import attendanceRoutes from "./routes/Attendence.routes.js";

dotenv.config();
DBCONNECT();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
