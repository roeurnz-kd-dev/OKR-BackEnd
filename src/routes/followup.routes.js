import express from "express";
import { createFollowup, deleteFollowup, getFollowupById, getFollowups, updateFollowup } from "../controllers/crm/followup.controller.js";
const router = express.Router();

router.post("/", createFollowup);
router.get("/", getFollowups);
router.get("/:id", getFollowupById);
router.put("/:id", updateFollowup);
router.delete("/:id", deleteFollowup);

export default router       