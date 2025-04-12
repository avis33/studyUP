// server/routes/register.js
import express from "express";
import { registerUser, loginUser, authMiddleware } from "../controllers/userController.js";

const router = express.Router();
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profilo", authMiddleware, (req, res) => {
    res.json({ message: "Hai accesso!", user: req.user });
  });

export default router;
