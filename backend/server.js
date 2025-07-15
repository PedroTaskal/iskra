// IskraDatingApp/backend/server.js
const express = require('express');
const dotenv = require('dotenv'); // Завантажуємо dotenv ПЕРШИМ
const connectDB = require('./config/db'); // Підключення до бази даних
const cors = require('cors'); // Для CORS-політики

// Завантаження змінних оточення з .env файлу
// Шлях `./.env` означає, що .env знаходиться в тій же папці, що й server.js
dotenv.config({ path: './.env' }); 

// Підключення до бази даних
connectDB();

const app = express();

// Middleware для обробки JSON запитів
app.use(express.json());
// Middleware для CORS. Дозволяємо запити з фронтенду, який працює на іншому порту.
app.use(cors({
    origin: 'http://127.0.0.1:5501', // Дозволити запити тільки з Live Server порту вашого фронтенду
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// !!! ВИДАЛЄНО/ЗАКОМЕНТОВАНО БАЗОВИЙ ТЕСТОВИЙ МАРШРУТ !!!
// app.get('/', (req, res) => {
//     res.send('Iskra Backend API is running...');
// });

// Маршрути для автентифікації користувачів
app.use('/api/auth', require('./routes/auth'));

// Обробка неіснуючих маршрутів (404 Not Found) - це стандартно для API
app.use((req, res, next) => {
    res.status(404).json({ message: 'Маршрут не знайдено' });
});

// Глобальний обробник помилок (опціонально, але корисно)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        message: err.message || 'Внутрішня помилка сервера'
    });
});


// Порт, на якому буде працювати сервер (завантажується з .env)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
