import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function sendLessonRequest(req, res) {
  const {
    tutorId,
    studentId,
    subject,
    date,
    mode,
    message,
    price
  } = req.body;

  try {
    const db = await connectToDatabase();
    const lessonsCollection = db.collection("lessons");

    const newLessonRequest = {
      studentId: new ObjectId(studentId),
      tutorId: new ObjectId(tutorId),
      subject: subject,
      date: new Date(date),
      mode: mode,
      status: "pending",
      price: price,
      message: message || "",
      createdAt: new Date()
    };

    const result = await lessonsCollection.insertOne(newLessonRequest);

    res.status(200).json({
      message: "Richiesta di lezione inviata con successo",
      lessonId: result.insertedId
    });
  } catch (error) {
    console.error("Errore invio richiesta:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}
