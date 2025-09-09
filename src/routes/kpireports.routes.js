import express from "express"
import { getKPIDashboard } from "../controllers/okrReport.controller.js";


const router = express.Router();
router.get("/", getKPIDashboard);
export default router;