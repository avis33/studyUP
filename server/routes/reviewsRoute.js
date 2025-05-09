import express from "express";
import {
    sendReview,getTutorOfTheWeek,getTopTutorsBySubject, getTutorStats
} from "../controllers/reviewsController.js";

const router = express.Router();
router.post("/send", sendReview)
router.get("/tutorOfWeek", getTutorOfTheWeek)
router.get("/tutorBySubject/:subject", getTopTutorsBySubject)
router.get("/getTutorData/:tutorId", getTutorStats)

export default router;
