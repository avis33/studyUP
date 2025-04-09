
import { connectToDatabase } from "../config/db.js";

export async function insertUser(req, res) {
    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection("users");

      console.log(req.body);
      
      const {
        firstName,
        lastName,
        email,
        password,
        birthDate,
        role,
        preferredSubjects,
        taughtSubjects,
        rate,
        bio,
      } = req.body;
      
      // Validazioni base (c'è gia lato client)
      if (!firstName || !lastName || !email || !password || !password || !role) {
        return res.status(400).json({ message: "Campi obbligatori mancanti o password non coincidono" });
      }
  
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email già registrata" });
      }
  
      // Crea oggetto da salvare
      
      const user = {
        firstName,
        lastName,
        email,
        password, // todo: da hashare in futuro con bcrypt!
        birthDate,
        role,
        createdAt: new Date(),
      };

      
      if (role === "student") {
        user.preferredSubjects = preferredSubjects
      }
  
      if (role === "tutor") {
        user.taughtSubjects = taughtSubjects
        user.rate = rate;
        user.bio = bio;
        user.rating = 0; // media voti iniziale
        user.reviewCount = 0; // numero recensioni
      }

      await usersCollection.insertOne(user);
      
      console.log("✅ Utente registrato");
      res.status(201).json({ message: "Utente registrato con successo" });
    } catch (error) {
      console.error("Errore durante la registrazione:", error);
      res.status(500).json({ message: "Errore interno del server" });
    }
  }