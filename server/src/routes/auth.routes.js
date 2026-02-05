import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// PUBLIC: Login remains open to everyone
router.post("/login", loginUser);

// PROTECTED: Only a logged-in ADMIN can create a new user
router.post("/register", protect, admin, registerUser);

export default router;
