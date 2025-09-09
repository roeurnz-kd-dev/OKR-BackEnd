import express from "express"
import { getOKRReports } from "../controllers/okrReport.controller.js";

const router = express.Router();
router.get("/", getOKRReports);
export default router;