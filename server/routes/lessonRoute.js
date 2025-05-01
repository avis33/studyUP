import express from "express";
import { sendLessonRequest} from "../controllers/lessons.js";

const router = express.Router();
router.post("/request", sendLessonRequest)

export default router;
