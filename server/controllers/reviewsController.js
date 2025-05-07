import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function sendReview(req, res) {
  const {
    lessonId,
    tutorId,
    studentId,
    subject,
    comment,
    ratings,
  } = req.body;

  if (!lessonId || !tutorId || !studentId || !subject || !comment || !ratings) {
    return res.status(400).json({ message: "Dati mancanti o incompleti." });
  }

  try {
    const db = await connectToDatabase();
    const reviewsCollection = db.collection("reviews");
    const lessonsCollection = db.collection("lessons");

    const newReview = {
      lessonId: new ObjectId(lessonId),
      tutorId: new ObjectId(tutorId),
      studentId: new ObjectId(studentId),
      subject,
      comment,
      ratings: {
        puntualita: parseInt(ratings.puntualita),
        chiarezza: parseInt(ratings.chiarezza),
        competenza: parseInt(ratings.competenza),
        empatia: parseInt(ratings.empatia),
      },
      createdAt: new Date()
    };

    const result = await reviewsCollection.insertOne(newReview);

    // Aggiorna lo status della lezione a "reviewed"
    await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: { status: "reviewed" } }
    );

    res.status(200).json({
      message: "Recensione inviata e lezione aggiornata con successo",
      reviewId: result.insertedId,
    });
  } catch (error) {
    console.error("Errore durante l'invio della recensione o l'aggiornamento della lezione:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}
