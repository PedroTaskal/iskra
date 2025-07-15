// backend/server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors'); // Імпортуємо cors

// Завантаження змінних оточення з .env файлу
dotenv.config({ path: './.env' }); // Шлях до .env відносно кореня проекту

// Підключення до бази даних
connectDB();

const app = express();

// Middleware
app.use(express.json()); // Дозволяє серверу приймати JSON в тілі запиту
app.use(cors()); // Дозволяє Cross-Origin Resource Sharing

// === Маршрути для сторінок ===
app.get("/users.html", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get('/', (req, res) => {
    // res.send('API is running...');
      res.sendFile(path.join(__dirname, "..", "auth.html"));
});

// Маршрути для автентифікації
app.use('/api/auth', require('./routes/auth'));

// Порт, на якому буде працювати сервер
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));