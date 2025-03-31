const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://apaul42:4cVZZu9VogE8KUvP@testclsuter.659h6.mongodb.net/own-search-engine", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

const BookSchema = new mongoose.Schema({
  filename: String,
  uploadedBy: String,
});

const querySchema = new mongoose.Schema({
    userId: { type: String, required: true }, 
    query: { type: String, required: true },  
    timestamp: { type: Date, default: Date.now } 
  });
  
const Query = mongoose.model("Query", querySchema);
const User = mongoose.model("User", UserSchema);
const Book = mongoose.model("Book", BookSchema);

module.exports = { User, Book, Query };
