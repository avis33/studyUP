
import { connectToDatabase } from "../config/db.js";
import bcrypt from 'bcrypt';

export async function registerUser(req, res) {
    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection("users");

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
      console.log(req.body);
      
      // Validazioni base (c'è gia lato client)
      if (!firstName || !lastName || !email || !password || !password || !role) {
        return res.status(400).json({ message: "Campi obbligatori mancanti" });
      }
  
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email già registrata" });
      }
  
      // Hasha la password 
      /*
      La password prima di inserirla nel database deve essere hashata (non criptata). L’hashing è un processo unidirezionale: 
      non si può "decrittare" una password hashata, si può solo confrontare l’hash con uno nuovo generato a partire dalla password inserita.
       */
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crea oggetto da salvare
      const user = {
        firstName,
        lastName,
        email,
        password: hashedPassword, // QUI USIAMO QUELLA HASHATA
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

export async function loginUser(req,res) {
  const {email, password} = req.body
  try {
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(401).json({ message: "Email o password errati" });
    
    // Confronta la password in chiaro con l’hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: "Email o password errati" });
    
    // Se tutto va bene
    res.status(200).json({ message: "Login riuscito", userId: user._id });    
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
}
 