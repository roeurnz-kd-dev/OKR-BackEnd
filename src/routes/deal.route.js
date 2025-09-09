import express  from "express";
import { addOpportunity, deleteOpportunity, getOpportunities, updateOpportunity, updateStage } from "../controllers/crm/deal.controller.js";



const router = express.Router();

router.post("/", addOpportunity);
router.get("/", getOpportunities);    // Get all opportunities
router.patch("/stage/:id", updateStage); // Update opportunity stage
router.delete("/:id", deleteOpportunity); // Delete opportunity
router.patch("/:id", updateOpportunity); // Update opportunity

export default router;  