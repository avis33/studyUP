import { connectToDatabase } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
// dotenv è una libreria che ti fa mette informazioni importanti come il link di connessione al database in un file .env sicuro che non viene esposto
import dotenv from "dotenv";
dotenv.config();

// xREGISTRATION.HTML (aggiunge uno studente o tutor al database dal form di registrazione, creando un nuovo jwt e rimandandolo al client)
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
      level,
      mode,
      region,
      city
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
      user.preferredSubjects = preferredSubjects;
    }

    if (role === "tutor") {
      user.taughtSubjects = taughtSubjects;
      user.rate = rate;
      user.bio = bio;
      user.level = level,
      user.mode = mode;
      if(mode === "presenza" || mode === "entrambe"){
        user.region = region
        user.city = city
      }
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
// xLOGIN.HTML (controlla email e password e crea un nuovo jwt e rimandandolo al client)
export async function loginUser(req, res) {
  const { email, password } = req.body;
  try {
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Email o password errati" });

    // Confronta la password in chiaro con l’hash
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "Email o password errati" });

    // Se tutto va bene
    // Genera un token JWT valido per 1 giorno
    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
        id: user._id,
        firstName: user.firstName,
        profilePicture: user.profilePicture,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );
    //al client mandiamo anche il token che verra messo nel localstorage
    res
      .status(200)
      .json({ message: "Login riuscito", userId: user._id, token });
  } catch (error) {
    console.error("Errore durante il login:", error);
    res.status(500).json({ message: "Errore interno del server" });
  }
}

// Middleware per proteggere rotte backend: xTUTTE LE PAGINE PER VERIFICARE SE L'UTENTE è LOGGATO CORRETTAMENTE
// serve a controllare se l’utente ha un token valido prima di lasciarlo accedere a certe API.
export function authMiddleware(req, res, next) {
  // 1. Estrae il token JWT dall'header "Authorization"
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token mancante", hasAccess:false });

  try {
    // 2. Verifica che il token sia valido (firma e scadenza)
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("//");
    console.log(decoded);
    console.log("//");

    // 3. Se valido, salva le info utente nel req per usarle più avanti
    req.user = decoded; // ora disponibile nei controller
    // 4. Passa al prossimo middleware o al controller
    next();
  } catch (err) {
    // 5. Se non è valido o è scaduto, rifiuta la richiesta
    res.status(403).json({ message: "Token non valido o scaduto", hasAccess:false });
  }
}

// xACCOUNT.HTML (Ottieni informazioni dell'utente associate al suo id per mostrarle sul form di update)
export async function getUserInfoById(req, res) {
  const userId = req.params.id;
  try {
    const db = await connectToDatabase();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato", error:true });
    }
    // Rimuovo la password per sicurezza
    const { password, ...userWithoutPassword } = user;
    res.status(200).json({ user: userWithoutPassword, error:false});
  } catch (error) {
    console.error("Errore nel recupero utente:", error);
    res.status(500).json({ message: "Errore del server",error:true});
  }
}
// xTROVATUTOR.HTML (Ottieni tutti i tutor disponibili nel database e se la richiesta è fatta da uno studente ritorna le materie preferite per personallizare i tutori mostrati lato client
export async function getDefaultTutor(req, res) {
    try {
      const db = await connectToDatabase();
      const usersCollection = db.collection("users");

      const userId = req.params.id;
      let preferredSubjects = null;
      if(userId != 0){
      const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
      if (user && user.role == "student") {
        preferredSubjects = user.preferredSubjects
      }
    }
      // Trova tutti i tutor
      const tutors = await usersCollection.find({ role: "tutor" }).project({ //ritorno solo alcuni campi
        _id: 1,
        firstName: 1,
        lastName: 1,
        profilePicture: 1,
        birthDate: 1,
        taughtSubjects: 1,
        level: 1,
        bio: 1,
        mode: 1,
        rate: 1,
        region: 1,
        city: 1,
        rating:1,
        reviewCount:1
      }).toArray();
  
      res.status(200).json({ tutors, preferredSubjects });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Errore del server", error: true });
    }
  };
  

// xACCOUNT.HTML (Per il form di update del profilo, aggiorna le informazioni e rigenera il JWT dato che potremmo aver modificato informazioni associate ad esso che dobbiamo aggiornare)
export async function updateProfile(req, res) {
  const {
    userId,
    firstName,
    lastName,
    email,
    birthDate,
    role,
    preferredSubjects,
    taughtSubjects,
    rate,
    bio,
    profilePicture,
  } = req.body;

  try {
    const db = await connectToDatabase();

    // Recupera l'utente attuale dal DB
    const existingUser = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    if (!existingUser) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // Prepara i campi da aggiornare
    const updateFields = {};

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (birthDate) updateFields.birthDate = birthDate;
    if (role) updateFields.role = role;
    if (preferredSubjects) updateFields.preferredSubjects = preferredSubjects;
    if (taughtSubjects) updateFields.taughtSubjects = taughtSubjects;
    if (rate) updateFields.rate = rate;
    if (bio) updateFields.bio = bio;
    if (profilePicture) updateFields.profilePicture = profilePicture;

    // Esegui l'update solo se ci sono campi da aggiornare
    if (Object.keys(updateFields).length > 0) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateFields }
      );
    }

    // Usa la foto nuova se esiste, altrimenti quella vecchia
    const updatedProfilePicture = profilePicture || existingUser.profilePicture;

    // RIGENERA IL TOKEN
    const token = jwt.sign(
      {
        email: email || existingUser.email,
        role: role || existingUser.role,
        id: userId,
        firstName: firstName || existingUser.firstName,
        profilePicture: updatedProfilePicture,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Utente aggiornato con successo", token });
  } catch (error) {
    console.error("Errore aggiornamento utente:", error);
    res.status(500).json({ message: "Errore del server" });
  }
}