const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected");
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clothes', require('./routes/clothRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));



app.listen(5000, () => console.log('Server running on port 5000'));
