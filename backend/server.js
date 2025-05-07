const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const { spawn } = require("node:child_process");
const path = require("path");
const { Book, Query } = require("./db");
const { authRouter, verifyToken } = require("./auth");

require("dotenv").config()

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration for production
app.use(cors({
  origin: true,
  credentials: true
}));

// Serve static files from the "books" folder
app.use("/books", express.static(path.join(__dirname, "books")));

// Register authentication routes
app.use("/auth", authRouter);

// Configure Multer for PDF uploads
const storage = multer.diskStorage({
  destination: "books/", 
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

// Helper to run Python scripts with error handling
function runPython(args, res, callback) {
  const pythonScript = path.join(__dirname, "search.py");
  const py = spawn("python3", [pythonScript, ...args]);
  let stdout = "";
  let stderr = "";

  py.stdout.on("data", data => {
    stdout += data.toString();
  });
  py.stderr.on("data", data => {
    stderr += data.toString();
    console.error(`Python stderr: ${data.toString()}`);
  });
  py.on("error", error => {
    console.error(`Failed to start python process: ${error}`);
    if (res) res.status(500).json({ msg: 'Failed to start python subprocess', error: error.message });
  });
  py.on("close", (code, signal) => {
    console.log(`Python process closed with code ${code}, signal ${signal}`);
    if (code !== 0) {
      console.error(`Python process exited with code ${code}`);
      if (res) return res.status(500).json({ msg: 'Python process exited with error', code, stderr });
    }
    callback(stdout);
  });
}

// Upload endpoint: handles file upload and model update
app.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { filename } = req.file;
    const uploadedBy = req.userEmail;
    await Book.create({ filename, uploadedBy });

    runPython(["__update__model__"], res, output => {
      try {
        const updateResponse = JSON.parse(output);
        res.json({ msg: "File uploaded and model updated successfully.", updateResponse });
      } catch (err) {
        console.error("Error parsing update response:", err);
        res.json({ msg: "File uploaded but model update response parsing failed.", updateResponse: output });
      }
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Upload failed." });
  }
});

// Manual model update endpoint
app.get("/update-model", verifyToken, (req, res) => {
  runPython(["update"], res, output => {
    try {
      res.json(JSON.parse(output));
    } catch (err) {
      console.error("Error parsing update response:", err);
      res.status(500).json({ msg: "Error parsing update response" });
    }
  });
});

// Search endpoint: runs query script and returns results
app.get("/search", verifyToken, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ msg: "Query required" });

  runPython([q], res, output => {
    try {
      const parsedResults = JSON.parse(output);
      Query.create({ userId: req.userEmail, query: q }).catch(err => console.error("Failed to save query:", err));
      res.json(parsedResults);
    } catch (err) {
      console.error("Error parsing search results:", err);
      res.status(500).json({ msg: "Error parsing search results" });
    }
  });
});

// Retrieve past queries
app.get("/queries", verifyToken, async (req, res) => {
  try {
    const pastQueries = await Query.find({ userId: req.userEmail }).sort({ timestamp: -1 });
    res.json({ pastQueries });
  } catch (error) {
    console.error("Failed to retrieve past queries:", error);
    res.status(500).json({ error: "Failed to retrieve past queries" });
  }
});

// Serve frontend
app.use(express.static(path.resolve(__dirname, "dist")));
app.get("/", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
