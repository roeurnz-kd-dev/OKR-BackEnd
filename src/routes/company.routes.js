import express from "express";
import { addCompany, deleteCompany, getCompanies, getCompanyById, updateCompany } from "../controllers/crm/company.controller.js";


const router = express.Router();

router.post("/", addCompany);
router.get("/", getCompanies);
router.get("/:id", getCompanyById);
router.patch("/:id", updateCompany);
router.delete("/:id", deleteCompany);

export default router;
