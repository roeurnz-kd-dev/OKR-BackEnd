import express from "express"
import { getOkrProgressTracker } from "../controllers/okrTracker.controller.js";

const router = express.Router();

router.get("/", getOkrProgressTracker);

export default router;