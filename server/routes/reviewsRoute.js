import express from "express";
import {
    sendReview
} from "../controllers/reviewsController.js";

const router = express.Router();
router.post("/send", sendReview)

export default router;
