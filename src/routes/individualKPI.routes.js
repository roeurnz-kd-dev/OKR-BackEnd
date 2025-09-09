import express from "express";
import { addIndividualKPI, deleteIndividualKPI, getIndividualKPIs } from "../controllers/individualKPI.controller.js";
 const router = express.Router();

 router.post("/", addIndividualKPI);
 router.get("/", getIndividualKPIs);
 router.delete("/:id", deleteIndividualKPI);
 export default router;