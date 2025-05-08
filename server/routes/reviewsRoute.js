import express from "express";
import {
    sendReview,getTutorOfTheWeek
} from "../controllers/reviewsController.js";

const router = express.Router();
router.post("/send", sendReview)
router.get("/tutorOfWeek", getTutorOfTheWeek)

export default router;
