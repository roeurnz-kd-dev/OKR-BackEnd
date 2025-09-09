import express from "express";
import { getCompanyKPIDashboard } from "../controllers/companyKpi.controller.js";
const router = express.Router();

router.get("/", getCompanyKPIDashboard);
 export default router;