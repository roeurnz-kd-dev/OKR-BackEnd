 import express from "express";
 const router = express.Router();
 import {
   createDepartmentOkr,
   getDepartmentOkrs,
   getDepartmentOkrById,
   deleteDepartmentOkr,
 } from "../controllers/departmentOkrs.controller.js";
import upload from "../middleware/upload.middleware.js";
// CRUD routes
router.post("/", upload.any(), createDepartmentOkr);
router.get("/", getDepartmentOkrs);
router.get("/:id", getDepartmentOkrById);
router.delete("/:id", deleteDepartmentOkr);

export default router;