import express from "express";
import { sendLessonRequest,
    getLessonsByStudentId,
    getLessonsByTutorId,
    acceptLessonRequest,
    rejectLessonRequest,
    cancelLessonRequest,
    mostFrequentSubjects
} from "../controllers/lessons.js";

const router = express.Router();
router.post("/request", sendLessonRequest)
router.post("/accept/:lessonId", acceptLessonRequest)
router.post("/reject/:lessonId", rejectLessonRequest)
router.delete("/cancel/:lessonId", cancelLessonRequest)
router.get("/student/:studentId", getLessonsByStudentId);
router.get("/tutor/:tutorId", getLessonsByTutorId);
router.get("/getFrequentSubjects", mostFrequentSubjects);

export default router;
