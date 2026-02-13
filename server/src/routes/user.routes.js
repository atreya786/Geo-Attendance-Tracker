import express from "express";
import { getAllEmployees } from "../controllers/user.controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/employees", protect, admin, getAllEmployees);

export default router;
