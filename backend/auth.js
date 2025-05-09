const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("./db");

require("dotenv").config()

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ msg: "No token provided" });
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ msg: "Invalid token" });
    req.userEmail = decoded.email;
    next();
  });
}

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: "User already exists" });
  
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({ email, password: hashedPassword });
  
  res.status(201).json({ msg: "User registered successfully" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ msg: "Invalid credentials" });
  }
  
  const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: "5h" });
  
  
  res.cookie("token", token, {
    secure: process.env.NODE_ENV === "production", 
    maxAge: 60*60*1000*5 
  });
  
  res.json({ msg: "Logged in successfully" });
});

router.post("/logout", verifyToken, (req, res) => {
  const expiredToken = jwt.sign({ email: req.userEmail }, SECRET_KEY, { expiresIn: "1ms" });
  res.cookie("token", expiredToken, {
    secure: process.env.NODE_ENV === "production",
    maxAge: 1      // expires almost immediately
  });
  res.json({ msg: "Logged out successfully" });
});

router.get("/me", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json({ loggedIn: false, msg: "Not logged in" });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.json({ loggedIn: false, msg: "Invalid token" });
    }
    res.json({ loggedIn: true, email: decoded.email });
  });
});

module.exports = { authRouter: router, verifyToken };
