import express  from "express";
import { forgotPassword, login, resetPassword, updatePassword } from "../controllers/auth.controller.js";

const router = express.Router();

// Configure multer for file uploads
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password/:userId", updatePassword);

 export default router;