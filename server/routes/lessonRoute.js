import express from "express";
import { sendLessonRequest,
    getLessonsByStudentId,
    getLessonsByTutorId,
    acceptLessonRequest,
    rejectLessonRequest
} from "../controllers/lessons.js";

const router = express.Router();
router.post("/request", sendLessonRequest)
router.post("/accept/:lessonId", acceptLessonRequest)
router.post("/reject/:lessonId", rejectLessonRequest)
router.get("/student/:studentId", getLessonsByStudentId);
router.get("/tutor/:tutorId", getLessonsByTutorId);

export default router;
