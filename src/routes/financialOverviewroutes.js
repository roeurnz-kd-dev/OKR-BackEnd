import express from 'express';
import { financialOverview, getFinancialRatios } from "../controllers/financialOverview.controller.js";

const router = express.Router();

 router.get("/", financialOverview);
 router.get("/ratios", getFinancialRatios);

export default router;