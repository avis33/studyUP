import express from "express";
import { connectToDatabase } from "./config/db.js";
import cors from "cors"
const app = express()

// MIddleware
app.use(express.json()); // Parse JSON in request bodies
app.use(cors()); // Allow frontend to communicate with the server

connectToDatabase()

const PORT = 3000
app.listen(PORT, ()=>console.log(`Server running at port ${PORT}`))
