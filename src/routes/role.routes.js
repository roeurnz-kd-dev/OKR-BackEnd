import express from 'express';
import {
  createRole,
  getAllRoles,

} from '../controllers/role.controller.js';



const router = express.Router();

router.post(
  "/",
  // verifyToken,
  // authorizeRoles("SuperAdmin"),
  createRole
);

router.get(
  "/",
  // verifyToken,
  // authorizeRoles("Admin", "SuperAdmin"),
  getAllRoles
);



export default router;