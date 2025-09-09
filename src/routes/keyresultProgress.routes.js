 import express from "express";
 const router = express.Router();
import { updateKeyResultProgress } from "../controllers/keyresultProgress.controller.js";




router.patch("/:id", updateKeyResultProgress);

export default router;
