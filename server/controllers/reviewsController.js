import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function sendReview(req, res) {
  const {
   
  } = req.body;

  try {
    const db = await connectToDatabase();
    const lessonsCollection = db.collection("reviews");

    res.status(200).json({
      message: "Review inviata con successo",
      lessonId: result.insertedId
    });
  } catch (error) {
    console.error("Errore invio review:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}