// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Цей шлях коректний
const jwt = require('jsonwebtoken');
// Старий: require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: '../../.env' }); // Важливо: шлях до .env

// Функція для генерації JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Токен дійсний 1 годину
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Будь ласка, введіть email та пароль' });
    }

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'Користувач з таким email вже існує' });
        }

        user = await User.create({
            email,
            password
        });

        res.status(201).json({
            message: 'Реєстрація успішна!',
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Будь ласка, введіть email та пароль' });
    }

    try {
        // Додати select('+password'), щоб Mongoose повернув поле пароля
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({ message: 'Невірні облікові дані' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Невірні облікові дані' });
        }

        res.json({
            message: 'Вхід успішний!',
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Помилка сервера' });
    }
});

module.exports = router;
