import express from "express";
import {
  createKeyResult,
  getKeyResults,
  getKeyResultById,
  deleteKeyResult,
} from "../controllers/keyresults.controller.js";
import upload from "../middleware/upload.middleware.js";

const router = express.Router();

router.post("/",createKeyResult);
router.get("/", getKeyResults);
router.get("/:id", getKeyResultById);
router.delete("/:id", deleteKeyResult);

export default router;
