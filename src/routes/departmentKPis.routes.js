import express from "express";
import { addDepartmentKPI, deleteDepartmentKPI, getDepartmentKPI } from "../controllers/departmentKPI.controller.js";

const router = express.Router();

router.post("/", addDepartmentKPI);
router.get("/", getDepartmentKPI);
router.delete("/:id", deleteDepartmentKPI);

export default router;
