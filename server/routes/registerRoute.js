// server/routes/register.js
import express from "express";
import { insertUser } from "../controllers/userController.js";

const router = express.Router();
router.post("/register", insertUser)


export default router;
