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

//we will create a post request to create a new note
app.post("/api/notes", async (req, res) => {
  //get the title and content from the request body
  const { title, content } = req.body;

  //if there is no title or content, return a 400 error
  if (!title || !content) {
    return res.status(400).send("we need a title and content");
  }

  //create a new note in the database using try-catch block
  try {
    const note = await prisma.note.create({
      data: { title, content },
    });
    res.json({ note });
  } catch (error) {
    res.status(500).send("An error occurred while creating the note");
  }
});

//we will create a put request to update a note
app.put("/api/notes/:id", async (req, res) => {
  //get the id, title and content from the request body
  const id  = parseInt(req.params.id);
  const { title, content } = req.body;

  //if there is no title or content, return a 400 error
  if (!title || !content) {
    return res.status(400).send("we need a title and content");
  }

  //if the note with the id does not exist, return a 400 error
  if (!id || isNaN(id)) {
    return res.status(400).send("we need a note id");
  }

  //update the note in the database using try-catch block
  try {
    const note = await prisma.note.update({
      where: { id },
      data: { title, content },
    });
    res.json({ note });
  } catch (error) {
    res.status(500).send("An error occurred while updating the note");
  }
});

//we will create a delete request to delete a note
app.delete("/api/notes/:id", async (req, res) => {
  //get the id from the request body
  const id = parseInt(req.params.id);

  //if the note with the id does not exist, return a 400 error
  if (!id || isNaN(id)) {
    return res.status(400).send("we need a note id");
  }

  //delete the note in the database using try-catch block
  try {
    const note = await prisma.note.delete({
      where: { id },
    });
    res.json({ note });
  } catch (error) {
    res.status(500).send("An error occurred while deleting the note");
  }
});

app.listen(5000, () => {
  console.log("server running on localhost:5000");
});
