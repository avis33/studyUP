import express from "express";
import { sendLessonRequest,
    getLessonsByStudentId,
    getLessonsByTutorId,
} from "../controllers/lessons.js";

const router = express.Router();
router.post("/request", sendLessonRequest)
router.get("/student/:studentId", getLessonsByStudentId);
router.get("/tutor/:tutorId", getLessonsByTutorId);

export default router;
