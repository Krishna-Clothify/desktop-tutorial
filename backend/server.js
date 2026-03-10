const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Root route (fixes "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Clothify Backend API is running 🚀");
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clothes', require('./routes/clothRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("MongoDB Connected");
})
.catch(err => {
  console.log("MongoDB Connection Error:", err);
});

// Use Render port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
