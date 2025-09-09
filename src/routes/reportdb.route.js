import express from "express";
import { addreport, deleteReport, getReport, getliquidityReport, getprofitabilityReport, getefficiencyReport, getAllReports, getAllPerformanceDashboardsData } from "../controllers/reportdb.controller.js";
import upload from "../utils/upload.js";

const router = express.Router();

router.post("/", upload.single("report"), addreport);
router.get("/", getReport);
router.get("/liquidity-ratio", getliquidityReport);
router.get("/efficiency-ratio", getefficiencyReport);
router.get("/profitability-ratio", getprofitabilityReport);
router.get("/balance-sheet", getAllReports);
router.get("/perfomance-dashbaord", getAllPerformanceDashboardsData);
router.delete("/:id", deleteReport);

export default router;
