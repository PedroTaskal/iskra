// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Переконайтесь, що шлях правильний
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../../.env' }); // Переконайтесь, що шлях правильний

// Функція для генерації JWT (залишається без змін)
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

        // Тепер пароль зберігається в чистому вигляді
        user = await User.create({
            email,
            password // Пароль передається як є
        });

        res.status(201).json({
            message: 'Реєстрація успішна!',
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error(error.message);
        // Залишаємо 500 для інших непередбачених помилок
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
        // !!! ЗМІНА ТУТ !!!: Більше не потрібно select('+password'), оскільки воно не було select: false
        const user = await User.findOne({ email }); 

        if (!user) {
            return res.status(400).json({ message: 'Невірні облікові дані' });
        }

        // !!! ЗМІНА ТУТ !!!: Пряме порівняння паролів
        // const isMatch = await user.matchPassword(password); // Цей метод видалено
        const isMatch = (password === user.password); // Пряме порівняння

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
