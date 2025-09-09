import express  from "express";
import { createOkrDependency, deleteOkrDependency, getOkrDependencies } from "../controllers/okr_dependency.controller.js";

const router = express.Router();

router.post("/", createOkrDependency);
router.get("/", getOkrDependencies);
router.delete("/:id", deleteOkrDependency);

export default router;