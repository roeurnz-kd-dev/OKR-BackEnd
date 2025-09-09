import express  from "express";
import { addLead, deleteLead, getLeadById, getLeads, updateLead, updateleadStatus } from "../controllers/crm/lead.controller.js";


const router = express.Router();

router.post("/", addLead);
router.get("/", getLeads);         // Get all leads
router.get("/:id", getLeadById);   // Get single lead
router.patch("/:id", updateLead);    // Update lead
router.delete("/:id", deleteLead);
router.patch("/status/:id", updateleadStatus);  // Update lead status

export default router;