import express from "express";
import { createOkr, deleteOkr, getOkrById, getOkrs } from "../controllers/okrs.controller.js";


const router = express.Router();

router.post("/", createOkr);
router.get("/", getOkrs);
router.get("/:id", getOkrById);
router.delete("/:id", deleteOkr);

export default router;
