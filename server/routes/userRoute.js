// server/routes/register.js
import express from "express";
import { registerUser, loginUser, authMiddleware ,getUserInfoById,updateProfile,getDefaultTutor} from "../controllers/userController.js";

const router = express.Router();
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/profilo", authMiddleware, (req, res) => {
    res.json({ message: "Hai accesso!", user: req.user, hasAccess:true });
  });
router.get("/getUserInfo/:id", getUserInfoById)
router.get("/fetchTutor/:id", getDefaultTutor)
router.post("/update", updateProfile)

export default router;
