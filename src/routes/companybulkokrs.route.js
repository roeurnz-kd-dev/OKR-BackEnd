
  import express from "express";
  const router = express.Router();
  import {
    createBulkCompanyOkrs
   
  } from "../controllers/companyBulkOkrs.controller.js";
import upload from "../middleware/upload.middleware.js";
  // CRUD routes
router.post("/", upload.any(), createBulkCompanyOkrs);

  

  export default router;
