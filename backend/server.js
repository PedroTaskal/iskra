// backend/server.js
const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors"); // Імпортуємо cors
const path = require("path");
const { protect } = require('./middleware/authMiddleware'); 

// Завантаження змінних оточення з .env файлу
dotenv.config({ path: "./.env" }); // Шлях до .env відносно кореня проекту

// Підключення до бази даних
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Дозволяє серверу приймати JSON в тілі запиту
app.use(cors()); // Дозволяє Cross-Origin Resource Sharing

// === Маршрути для сторінок ===
app.get("/index.html", protect, (req, res) => {
  console.log("index.html served");
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

app.get("/", (req, res) => {
  console.log("Root path accessed, redirecting to auth.html");
  res.sendFile(path.join(__dirname, "..", "frontend", "auth.html"));
});

// Маршрути для автентифікації
app.use("/api/auth", require("./routes/auth"));

app.use(express.static(path.join(__dirname, "..", "frontend")));

// Порт, на якому буде працювати сервер (завантажується з .env)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
