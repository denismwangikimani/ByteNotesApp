"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pg_1 = require("pg");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Load environment variables from .env
dotenv_1.default.config();
const app = (0, express_1.default)();
const SECRET_KEY = process.env.SECRET_KEY || "secret";
// Set up the pg Pool connection to the database
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
// Test the connection to the database
function getPgVersion() {
    return __awaiter(this, void 0, void 0, function* () {
        const client = yield pool.connect();
        try {
            const result = yield client.query("SELECT version()");
            console.log(result.rows[0]);
        }
        finally {
            client.release();
        }
    });
}
getPgVersion();
// Middleware to parse JSON bodies
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Sign up route (with hashed password)
app.post("/api/auth/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    // Hash the password before saving
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    try {
        // Check if the username already exists
        const existingUser = yield pool.query('SELECT id FROM "User" WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already taken" });
        }
        // Create the new user
        const newUser = yield pool.query('INSERT INTO "User" (username, password) VALUES ($1, $2) RETURNING *', [username, hashedPassword]);
        res.status(201).json(newUser.rows[0]);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating user" });
    }
}));
// Login route
app.post("/api/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        // Find the user by username
        const userResult = yield pool.query('SELECT * FROM "User" WHERE username = $1', [username]);
        const user = userResult.rows[0];
        if (!user || !(yield bcrypt_1.default.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        // Generate a JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, SECRET_KEY, {
            expiresIn: "1h",
        });
        res.status(200).json({ token, username: user.username });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error logging in" });
    }
}));
// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
    var _a;
    // Extract the token from the header
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token required" });
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.userId = decoded.userId;
        next();
    });
};
// Protected route for notes
app.get("/api/notes", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Fetching notes for user:", req.userId);
        const notes = yield pool.query('SELECT * FROM "Note" WHERE "userId" = $1', [req.userId]);
        console.log("Fetched notes:", notes.rows);
        res.json({ notes: notes.rows });
    }
    catch (error) {
        console.error("Error retrieving notes:", error);
        res.status(500).json({ message: "Error retrieving notes" });
    }
}));
// Create note route
app.post("/api/notes", authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, content } = req.body;
    console.log("Creating a new note:", { title, content, userId: req.userId });
    if (!title || !content) {
        console.log("Title or content missing");
        return res
            .status(400)
            .json({ message: "Title and content are required" });
    }
    try {
        const note = yield pool.query('INSERT INTO "Note" (title, content, "userId") VALUES ($1, $2, $3) RETURNING *', [title, content, req.userId]);
        console.log("Note created successfully:", note.rows[0]);
        res.json({ note: note.rows[0] });
    }
    catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({ message: "Error creating note" });
    }
}));
// Update note route
app.put("/api/notes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).send("Title and content are required");
    }
    if (!id || isNaN(id)) {
        return res.status(400).send("Invalid note id");
    }
    try {
        const note = yield pool.query('UPDATE "Note" SET title = $1, content = $2 WHERE id = $3 RETURNING *', [title, content, id]);
        res.json({ note: note.rows[0] });
    }
    catch (error) {
        res.status(500).send("An error occurred while updating the note");
    }
}));
// Delete note route
app.delete("/api/notes/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    if (!id || isNaN(id)) {
        return res.status(400).send("Invalid note id");
    }
    try {
        const note = yield pool.query('DELETE FROM "Note" WHERE id = $1 RETURNING *', [id]);
        res.json({ note: note.rows[0] });
    }
    catch (error) {
        res.status(500).send("An error occurred while deleting the note");
    }
}));
app.listen(5000, () => {
    console.log("Server running on localhost:5000");
});
//# sourceMappingURL=index.js.map