  import express from "express";
  const router = express.Router();
  import {
    createCompanyOkr,
    getCompanyOkrs,
    getCompanyOkrById,
    deleteCompanyOkr,
  } from "../controllers/companyOkrs.controller.js";
import upload from "../middleware/upload.middleware.js";
  // CRUD routes
router.post("/", upload.any(), createCompanyOkr);

  router.get("/", getCompanyOkrs);
  router.get("/:id", getCompanyOkrById);
  router.delete("/:id",deleteCompanyOkr);

  export default router;
