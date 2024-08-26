import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// Load environment variables from .env
dotenv.config();

const app = express();

const SECRET_KEY = process.env.SECRET_KEY || "secret";

// Set up the pg Pool connection to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, 
});

// Test the connection to the database
async function getPgVersion() {
  const client = await pool.connect();
  try {
    const result = await client.query("SELECT version()");
    console.log(result.rows[0]);
  } finally {
    client.release();
  }
}
getPgVersion();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// Extend Express Request to include userId
interface AuthenticatedRequest extends Request {
  userId?: number;
}

// Sign up route (with hashed password)
app.post("/api/auth/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Check if the username already exists
    const existingUser = await pool.query(
      'SELECT id FROM "User" WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username already taken" });
    }

    // Create the new user
    const newUser = await pool.query(
      'INSERT INTO "User" (username, password) VALUES ($1, $2) RETURNING *',
      [username, hashedPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login route
app.post("/api/auth/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const userResult = await pool.query(
      'SELECT * FROM "User" WHERE username = $1',
      [username]
    );

    const user = userResult.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT
    const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Middleware to authenticate JWT
const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  // Extract the token from the header
  const token = req.headers.authorization?.split(" ")[1]; 

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
app.get(
  "/api/notes",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      console.log("Fetching notes for user:", req.userId);
      const notes = await pool.query(
        'SELECT * FROM "Note" WHERE "userId" = $1',
        [req.userId]
      );
      console.log("Fetched notes:", notes.rows);
      res.json({ notes: notes.rows });
    } catch (error) {
      console.error("Error retrieving notes:", error);
      res.status(500).json({ message: "Error retrieving notes" });
    }
  }
);

// Create note route
app.post(
  "/api/notes",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const { title, content } = req.body;
    console.log("Creating a new note:", { title, content, userId: req.userId });

    if (!title || !content) {
      console.log("Title or content missing");
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    try {
      const note = await pool.query(
        'INSERT INTO "Note" (title, content, "userId") VALUES ($1, $2, $3) RETURNING *',
        [title, content, req.userId]
      );
      console.log("Note created successfully:", note.rows[0]);
      res.json({ note: note.rows[0] });
    } catch (error) {
      console.error("Error creating note:", error);
      res.status(500).json({ message: "Error creating note" });
    }
  }
);

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
    const note = await pool.query(
      'UPDATE "Note" SET title = $1, content = $2 WHERE id = $3 RETURNING *',
      [title, content, id]
    );
    res.json({ note: note.rows[0] });
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
    const note = await pool.query(
      'DELETE FROM "Note" WHERE id = $1 RETURNING *',
      [id]
    );
    res.json({ note: note.rows[0] });
  } catch (error) {
    res.status(500).send("An error occurred while deleting the note");
  }
});

app.listen(5000, () => {
  console.log("Server running on localhost:5000");
});
