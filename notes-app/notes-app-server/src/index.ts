import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Load environment variables from .env
dotenv.config();

const app = express();
const prisma = new PrismaClient();

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key"; // Ensure to set this in .env file

app.use(express.json());
app.use(cors());

// Extend Express Request to include userId
interface AuthenticatedRequest extends Request {
  userId?: number;
}

// Sign up route (without hashing)
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  console.log("Received username:", username);
  console.log("Received password:", password);

  // Check if the username already exists
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return res.status(400).json({ message: "Username already taken" });
  }

  try {
    // Create the new user with plain text password (for testing purposes)
    const newUser = await prisma.user.create({
      data: {
        username,
        password, // Save password directly (not hashed)
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login route (without password comparison)
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1h" });
    console.log("Generated token:", token);

    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Middleware to authenticate JWT
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from the header

  if (!token) {
    return res.status(401).json({ message: "Token required" });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  });
};

// Protected route for notes
app.get("/api/notes", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const notes = await prisma.note.findMany({
    where: { userId: req.userId },
  });
  res.json({ notes });
});

// Create note route
app.post("/api/notes", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required" });
  }

  try {
    const note = await prisma.note.create({
      data: {
        title,
        content,
        user: { connect: { id: req.userId } }, // Associate the note with the logged-in user
      },
    });
    res.json({ note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating note" });
  }
});

// Update note route
app.put("/api/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).send("Title and content are required");
  }

  if (!id || isNaN(id)) {
    return res.status(400).send("Invalid note id");
  }

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

// Delete note route
app.delete("/api/notes/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id)) {
    return res.status(400).send("Invalid note id");
  }

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
  console.log("Server running on localhost:5000");
});
