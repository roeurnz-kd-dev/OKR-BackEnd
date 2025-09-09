import express from "express";
import { addKPI, deleteKPI, getKPIById, getKPIs, patchKPIProgress, updateKPI, updateKPIAssignment, } from "../controllers/kpi.controller.js";

const router = express.Router();

router.post("/", addKPI);
router.get("/", getKPIs);

router.get("/:id", getKPIById);
router.patch("/assign/:id", updateKPIAssignment);
router.delete("/:id", deleteKPI);
router.patch("/:id", updateKPI);
router.patch("/progress/:id", patchKPIProgress);


export default router;