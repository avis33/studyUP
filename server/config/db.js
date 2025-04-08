import { MongoClient } from "mongodb";

const uri = "mongodb+srv://avis:8LYyTauhpLyVp8JI@studyupcluster.hytamy1.mongodb.net/?retryWrites=true&w=majority&appName=StudyUpCluster"
  
const client = new MongoClient(uri);

let db;
export async function connectToDatabase() {
  try {
    if (db) return db; // Return cached database connection if it exists
    await client.connect();
    db = await client.db("StudyUp");
    console.log("✅ Successfully connected to MongoDB!✅");
    return db;
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    process.exit(1);
  }
}
