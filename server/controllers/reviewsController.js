import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

// x DASHBOARD.HTML (Inserisce recensione dello studente nel database e aggiorna statistiche del tutor)
export async function sendReview(req, res) {
  const { lessonId, tutorId, studentId, subject, comment, ratings } = req.body;

  if (!lessonId || !tutorId || !studentId || !subject || !comment || !ratings) {
    return res.status(400).json({ message: "Dati mancanti o incompleti." });
  }

  try {
    const db = await connectToDatabase();
    const reviewsCollection = db.collection("reviews");
    const lessonsCollection = db.collection("lessons");
    const usersCollection = db.collection("users");
    // Recupera la lezione per ottenere la data
    const lesson = await lessonsCollection.findOne({
      _id: new ObjectId(lessonId),
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lezione non trovata." });
    }

    // Calcola la media della nuova recensione
    const newRatingValue =
      (parseInt(ratings.puntualita) +
        parseInt(ratings.chiarezza) +
        parseInt(ratings.competenza) +
        parseInt(ratings.empatia)) /
      4;

    const newReview = {
      lessonId: new ObjectId(lessonId),
      tutorId: new ObjectId(tutorId),
      studentId: new ObjectId(studentId),
      subject,
      lessonDate: lesson.date,
      comment,
      ratings: {
        puntualita: parseInt(ratings.puntualita),
        chiarezza: parseInt(ratings.chiarezza),
        competenza: parseInt(ratings.competenza),
        empatia: parseInt(ratings.empatia),
      },
      createdAt: new Date(),
    };

    // Inserisce la recensione
    const result = await reviewsCollection.insertOne(newReview);

    // Aggiorna lo status della lezione
    await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: { status: "reviewed" } }
    );

    // Ottieni rating attuale e reviewCount dal tutor
    const tutor = await usersCollection.findOne({ _id: new ObjectId(tutorId) });

    const prevRating = tutor.rating || 0;
    const prevCount = tutor.reviewCount || 0;

    const newCount = prevCount + 1;

    const updatedRating =
      prevCount === 0
        ? newRatingValue
        : (prevRating * prevCount + newRatingValue) / newCount;

    // Aggiorna il tutor con nuovo rating e reviewCount
    await usersCollection.updateOne(
      { _id: new ObjectId(tutorId) },
      {
        $set: { rating: updatedRating },
        $inc: { reviewCount: 1 },
      }
    );

    res.status(200).json({
      message:
        "Recensione inviata, lezione aggiornata, rating tutor aggiornato",
      reviewId: result.insertedId,
    });
  } catch (error) {
    console.error(
      "Errore durante l'invio della recensione o l'aggiornamento:",
      error
    );
    res.status(500).json({ message: "Errore del server" });
  }
}

// x RATINGS.HTML (ottieni tutor della settimana)
export const getTutorOfTheWeek = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const reviewsCollection = db.collection("reviews");
    const usersCollection = db.collection("users");

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Recensioni dell'ultima settimana
    const recentReviews = await reviewsCollection
      .find({ lessonDate: { $gte: sevenDaysAgo } })
      .toArray();

    // Raggruppa recensioni per tutor
    const tutorStats = {};

    for (const review of recentReviews) {
      const tutorId = review.tutorId.toString();
      const ratings = review.ratings;

      const avgRating =
        (ratings.puntualita +
          ratings.chiarezza +
          ratings.competenza +
          ratings.empatia) / 4;

      if (!tutorStats[tutorId]) {
        tutorStats[tutorId] = {
          totalRating: 0,
          count: 0,
          subjects: new Set(),
        };
      }

      tutorStats[tutorId].totalRating += avgRating;
      tutorStats[tutorId].count += 1;

      if (review.subject) {
        tutorStats[tutorId].subjects.add(review.subject);
      }
    }

    const tutorsRanked = [];

    for (const [tutorId, data] of Object.entries(tutorStats)) {
      const avg = data.totalRating / data.count;
      // Calcola punteggio ponderato (media * log(count + 1))
      const weightedScore = avg * Math.log(data.count + 1);

      const tutor = await usersCollection.findOne({ _id: new ObjectId(tutorId) });

      tutorsRanked.push({
        tutorId,
        name: `${tutor.firstName} ${tutor.lastName}`,
        profilePicture: tutor.profilePicture,
        city: tutor.city,
        subjects: Array.from(data.subjects), // materie insegnate nella settimana
        level: tutor.level,
        rating: parseFloat(avg.toFixed(2)),
        lessonsCount: data.count,
        score: parseFloat(weightedScore.toFixed(2)),
      });
    }

    // Ordina i tutor per punteggio
    tutorsRanked.sort((a, b) => b.score - a.score);
    // Prendiamo solo i primi 7 
    const top7 = tutorsRanked.slice(0, 7);
    res.status(200).json({
      message: "Classifica tutor della settimana",
      tutors: top7,
    });
  } catch (error) {
    console.error("Errore durante la ricezione dei tutor della settimana", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// x RATINGS.HTML (ottieni tutor filtrati per materia e livello)
export const getTopTutorsBySubject = async (req, res) => {
  try {
    const { subject } = req.params;
    const { level } = req.query;

    if (!subject) {
      return res.status(400).json({ message: "Materia richiesta" });
    }

    const db = await connectToDatabase();
    const reviewsCollection = db.collection("reviews");
    const usersCollection = db.collection("users");

    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30); // Prendiamo le lezioni degli ultimi trenta giorni 

    const recentReviews = await reviewsCollection
      .find({ lessonDate: { $gte: lastMonth }, subject })
      .toArray();

    const tutorStats = {};
    const levelIsFiltered = level && level !== "Qualunque"; 

    for (const review of recentReviews) {
      const tutorId = review.tutorId.toString();
      const ratings = review.ratings;

      const avgRating =
        (ratings.puntualita +
          ratings.chiarezza +
          ratings.competenza +
          ratings.empatia) / 4;

      if (!tutorStats[tutorId]) {
        tutorStats[tutorId] = {
          totalRating: 0,
          count: 0,
        };
      }

      tutorStats[tutorId].totalRating += avgRating;
      tutorStats[tutorId].count += 1;
    }

    const tutorsRanked = [];

    for (const [tutorId, data] of Object.entries(tutorStats)) {
      const tutor = await usersCollection.findOne({ _id: new ObjectId(tutorId) });

      // Filtro per livello se necessario
      if (!tutor) continue;
      if(!levelIsFiltered){
      const avg = data.totalRating / data.count;
      const weightedScore = avg * Math.log(data.count + 1);
      
      tutorsRanked.push({
        tutorId,
        name: `${tutor.firstName} ${tutor.lastName}`,
        profilePicture: tutor.profilePicture,
        city: tutor.city,
        level: tutor.level,
        rating: parseFloat(avg.toFixed(2)),
        lessonsCount: data.count,
        score: parseFloat(weightedScore.toFixed(2)),
      });
    }else{
      if(level.toLowerCase() == tutor.level){
        const avg = data.totalRating / data.count;
        const weightedScore = avg * Math.log(data.count + 1);
        tutorsRanked.push({
          tutorId,
          name: `${tutor.firstName} ${tutor.lastName}`,
          profilePicture: tutor.profilePicture,
          city: tutor.city,
          level: tutor.level,
          rating: parseFloat(avg.toFixed(2)),
          lessonsCount: data.count,
          score: parseFloat(weightedScore.toFixed(2)),
        });
      }
      
    }
  }
    tutorsRanked.sort((a, b) => b.score - a.score);
    const top10 = tutorsRanked.slice(0, 10);

    res.status(200).json({
      message: `Top 10 tutor per la materia "${subject}"${levelIsFiltered ? ` (livello: ${level})` : ""} degli ultimi 30 giorni`,
      tutors: top10,
    });
  } catch (error) {
    console.error("Errore durante la ricezione dei top tutor per materia", error);
    res.status(500).json({ message: "Errore del server" });
  }
};

// x DASHBOARD.HTML LATO TUTOR (ottieni statistiche del tutor per sezione le tue statistiche)
export const getTutorStats = async (req, res) => {
  try {
    const { tutorId } = req.params;
    const db = await connectToDatabase();
    const reviewsCollection = db.collection("reviews");
    const usersCollection = db.collection("users");
    const lessonsCollection = db.collection("lessons");

    // Verifica che il tutor esista
    const tutor = await usersCollection.findOne({ 
      _id: new ObjectId(tutorId),
      role: "tutor"
    });

    if (!tutor) {
      return res.status(404).json({ message: "Tutor non trovato" });
    }

    // Ottieni tutte le recensioni del tutor
    const reviews = await reviewsCollection.find({ 
      tutorId: new ObjectId(tutorId) 
    }).toArray();

    // Calcola le statistiche delle recensioni
    let stats = {
      totalLessons: 0,
      totalReviews: reviews.length,
      avgRating: 0,
      ratings: {
        puntualita: 0,
        chiarezza: 0,
        competenza: 0,
        empatia: 0
      }
    };

    if (reviews.length > 0) {
      // Calcola la media per ogni categoria
      const sumRatings = reviews.reduce((acc, review) => {
        acc.puntualita += review.ratings.puntualita;
        acc.chiarezza += review.ratings.chiarezza;
        acc.competenza += review.ratings.competenza;
        acc.empatia += review.ratings.empatia;
        return acc;
      }, { puntualita: 0, chiarezza: 0, competenza: 0, empatia: 0 });

      // Calcola le medie
      stats.ratings = {
        puntualita: parseFloat((sumRatings.puntualita / reviews.length).toFixed(2)),
        chiarezza: parseFloat((sumRatings.chiarezza / reviews.length).toFixed(2)),
        competenza: parseFloat((sumRatings.competenza / reviews.length).toFixed(2)),
        empatia: parseFloat((sumRatings.empatia / reviews.length).toFixed(2))
      };

      // Calcola la valutazione media complessiva
      const totalAvg = (stats.ratings.puntualita + stats.ratings.chiarezza + 
                       stats.ratings.competenza + stats.ratings.empatia) / 4;
      stats.avgRating = parseFloat(totalAvg.toFixed(2));
    }

    // Conta tutte le lezioni completate dal tutor
    stats.totalLessons = await lessonsCollection.countDocuments({
      tutorId: new ObjectId(tutorId),
      status: { $in: ["completed", "reviewed"] }
    });

    // Aggiungi le informazioni base del tutor
    stats.tutorInfo = {
      name: `${tutor.firstName} ${tutor.lastName}`,
      subjects: tutor.taughtSubjects,
      level: tutor.level,
      city: tutor.city,
      profilePicture: tutor.profilePicture
    };

    res.status(200).json({
      message: "Statistiche tutor ottenute con successo",
      data: stats
    });
  } catch (error) {
    console.error("Errore durante la ricezione dei dati", error);
    res.status(500).json({ message: "Errore del server" });
  }
};