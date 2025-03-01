//Attendence
import express from "express";
import Attendance from "../models/Attendence.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all attendance routes
router.use(authMiddleware);

// Mark Attendance
router.post("/mark", async (req, res) => {
    try {
        const { status } = req.body;
        const userId = req.user.userId; // Get userId from authenticated user

        const attendance = await Attendance.create({ userId, status });
        res.status(201).json({ message: "Attendance marked successfully", attendance });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ 
            message: "Error marking attendance", 
            error: error.message 
        });
    }
});

// Get Attendance Records
router.get("/my-records", async (req, res) => {
    try {
        const userId = req.user.userId; // Get userId from authenticated user
        const records = await Attendance.find({ userId })
            .sort({ date: -1 }) // Sort by date in descending order
            .populate('userId', 'name email'); // Populate user details

        res.json({ 
            message: "Attendance records fetched successfully", 
            records 
        });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ 
            message: "Error fetching attendance records", 
            error: error.message 
        });
    }
});

export default router;
