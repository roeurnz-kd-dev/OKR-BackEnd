import express from "express";
import { getLeadAndDealStats, getSalesforecast } from "../controllers/crm/crmreport.controller.js";
const router = express.Router();

router.get("/", getLeadAndDealStats);
router.get("/salesforecast", getSalesforecast);
export default router;