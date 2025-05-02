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
      status: "pending", // puo essere accepted e cancelled
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
export async function getLessonsByStudentId(req, res) {
  const { studentId } = req.params;

  try {
    const db = await connectToDatabase();
    const lessons = await db.collection("lessons").aggregate([
      {
        $match: { studentId: new ObjectId(studentId) }
      },
      {
        $lookup: {
          from: "users",
          localField: "tutorId",
          foreignField: "_id",
          as: "tutorInfo"
        }
      },
      {
        $unwind: "$tutorInfo"
      },
      {
        $project: {
          subject: 1,
          date: 1,
          mode: 1,
          status: 1,
          price: 1,
          createdAt: 1,
          message: 1,
          tutor: {
            _id: "$tutorInfo._id",
            nome: "$tutorInfo.firstName",
            cognome: "$tutorInfo.lastName",
            email: "$tutorInfo.email"
          }
        }
      },
      { $sort: { date: -1 } }
    ]).toArray();

    res.status(200).json(lessons);
  } catch (error) {
    console.error("Errore nel recupero delle lezioni per studente:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}

export async function getLessonsByTutorId(req, res) {
  const { tutorId } = req.params;

  try {
    const db = await connectToDatabase();
    const lessons = await db.collection("lessons").aggregate([
      {
        $match: { tutorId: new ObjectId(tutorId) }
      },
      {
        $lookup: {
          from: "users",
          localField: "studentId",
          foreignField: "_id",
          as: "studentInfo"
        }
      },
      {
        $unwind: "$studentInfo"
      },
      {
        $project: {
          subject: 1,
          date: 1,
          mode: 1,
          status: 1,
          price: 1,
          message: 1,
          createdAt: 1,
          student: {
            _id: "$studentInfo._id",
            nome: "$studentInfo.firstName",
            cognome: "$studentInfo.lastName",
            email: "$studentInfo.email"
          }
        }
      },
      { $sort: { date: -1 } }
    ]).toArray();

    res.status(200).json(lessons);
  } catch (error) {
    console.error("Errore nel recupero delle lezioni per tutor:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}
// Controller per accettare una lezione
export async function acceptLessonRequest(req, res) {
  const { lessonId } = req.params;

  try {
    const db = await connectToDatabase();
    const lessonsCollection = db.collection("lessons");

    // Verifica che la lezione esista e sia in stato pending
    const lesson = await lessonsCollection.findOne({
      _id: new ObjectId(lessonId),
      status: "pending"
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lezione non trovata o già confemata/cancellata" });
    }

    // Aggiorna lo stato della lezione
    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: { status: "accepted", updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Impossibile accettare la lezione" });
    }

    res.status(200).json({ 
      success: true,
      message: "Lezione accettata con successo"
    });

  } catch (error) {
    console.error("Errore accettazione lezione:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}

// Controller per rifiutare una lezione
export async function rejectLessonRequest(req, res) {
  const { lessonId } = req.params;

  try {
    const db = await connectToDatabase();
    const lessonsCollection = db.collection("lessons");

    // Verifica che la lezione esista e sia in stato pending
    const lesson = await lessonsCollection.findOne({
      _id: new ObjectId(lessonId),
      status: "pending"
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lezione non trovata o già gestita" });
    }

    // Aggiorna lo stato della lezione
    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: { status: "rejected", updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({ message: "Impossibile rifiutare la lezione" });
    }

    // Qui potresti inviare una notifica allo studente

    res.status(200).json({ 
      success: true,
      message: "Lezione rifiutata con successo"
    });

  } catch (error) {
    console.error("Errore rifiuto lezione:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}