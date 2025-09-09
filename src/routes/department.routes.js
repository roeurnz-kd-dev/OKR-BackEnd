import express from "express";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  deleteDepartment,
} from "../controllers/departments.controller.js";

const router = express.Router();

router.post("/", createDepartment);
router.get("/", getDepartments);
router.get("/:id", getDepartmentById);
router.delete("/:id", deleteDepartment);

export default router;
