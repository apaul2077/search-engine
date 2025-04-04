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
app.use(cors({
  origin: "http://localhost:5173", 
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

app.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  try {
    const { filename } = req.file;
    const uploadedBy = req.userEmail;
  
    // Save book metadata to MongoDB
    await Book.create({ filename, uploadedBy });

    const pythonScript = path.join(__dirname, "search.py");
    const python = spawn("python", [pythonScript, "__update__model__"]);
    let output = "";

    // Capture Python script output
    python.stdout.on("data", (data) => {
      output += data.toString();
    });

    python.stderr.on("data", (data) => {
      console.error("stderr:", data.toString());
    });

    python.on("close", (code) => {
      try {
        const updateResponse = JSON.parse(output);
        res.json({
          msg: "File uploaded and model updated successfully.",
          updateResponse,
        });
      } catch (err) {
        console.error("Error parsing update response:", err);
        res.json({
          msg: "File uploaded but model update response parsing failed.",
          updateResponse: output,
        });
      }
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ msg: "Upload failed." });
  }
});


app.get("/update-model", verifyToken, (req, res) => {
  const pythonScript = path.join(__dirname, "search.py");
  const python = spawn("python", [pythonScript, "update"]);
  let output = "";

  python.stdout.on("data", (data) => {
    output += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("stderr:", data.toString());
  });

  python.on("close", (code) => {
    try {
      res.json(JSON.parse(output));
    } catch (err) {
      res.status(500).json({ msg: "Error parsing update response" });
    }
  });
});



app.get("/search", verifyToken, async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ msg: "Query required" });

  const pythonScript = path.join(__dirname, "search.py");
  const python = spawn("python", [pythonScript, q]);
  let results = "";

  python.stdout.on("data", (data) => {
    results += data.toString();
  });

  python.on("close", async () => {
    try {
      const parsedResults = JSON.parse(results);

      await Query.create({ userId: req.userEmail, query: q });

      res.json(parsedResults);
    } catch (err) {
      res.status(500).json({ msg: "Error parsing search results" });
    }
  });
});

app.get("/queries", verifyToken, async (req, res) => {
  try {
    const userId = req.userEmail; 
    const pastQueries = await Query.find({ userId }).sort({ timestamp: -1 }); 

    res.json({ pastQueries });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve past queries" });
  }
});


app.listen(5000, () => console.log("Server running on port 5000"));
