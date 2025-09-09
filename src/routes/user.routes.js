import express from 'express';
import { registerUser,getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller.js';
const router = express.Router();

router.post("/", registerUser);
// router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.patch("/:id", updateUser);
router.delete("/:id",deleteUser);


export default router;
