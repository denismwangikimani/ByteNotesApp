import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

//create an express app and initiate a Prisma client instance
const app = express();
const prisma = new PrismaClient();

//middleware to parse JSON data and enable CORS
app.use(express.json());
app.use(cors());

//we will get all notes from the database
app.get("/api/notes", async (req, res) => {
  const notes = await prisma.note.findMany();
  res.json({ notes });
});

app.listen(5000, () => {
  console.log("server running on localhost:5000");
});