import express from "express";
const router = express.Router();

import { createIndividualOkr, deleteIndividualOkr, getIndividualOkrById, getIndividualOkrs } from "../controllers/indivdualOkrs.controller.js";
import upload from "../middleware/upload.middleware.js";
// CRUD routes
router.post("/", upload.any(), createIndividualOkr);
router.get("/", getIndividualOkrs);
router.get("/:id", getIndividualOkrById);
router.delete("/:id", deleteIndividualOkr);

export default router;
