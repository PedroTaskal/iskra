// IskraDatingApp/backend/routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Шлях від routes до models
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware"); // Імпортуємо охоронця

// Функція для генерації JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // process.env.JWT_SECRET буде доступний
    expiresIn: "1h", // Токен дійсний 1 годину
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Будь ласка, введіть email та пароль" });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(400)
        .json({ message: "Користувач з таким email вже існує" });
    }

    // Пароль буде автоматично хешований завдяки UserSchema.pre('save')
    user = await User.create({
      email,
      password,
    });

    res.status(201).json({
      message: "Реєстрація успішна!",
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error.message); // Логування помилки для розробника
    // У разі помилки від MongoDB (наприклад, дублікат ключа при унікальному email)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Цей email вже зареєстрований." });
    }
    res.status(500).json({ message: "Помилка сервера під час реєстрації." });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Будь ласка, введіть email та пароль" });
  }

  try {
    // Явно вибираємо пароль, оскільки він має select: false
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Невірні облікові дані." });
    }

    // Використовуємо метод, визначений у моделі User для порівняння хешів
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Невірні облікові дані." });
    }

    res.json({
      message: "Вхід успішний!",
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error.message); // Логування помилки для розробника
    res.status(500).json({ message: "Помилка сервера під час входу." });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (захищений)
router.get("/me", protect, async (req, res) => {
  // Завдяки 'protect' middleware, у нас є доступ до req.user
  // Ми додали його в authMiddleware.js
  if (req.user) {
    res.json({
      id: req.user._id,
      email: req.user.email,
      createdAt: req.user.createdAt,
    });
  } else {
    res.status(404).json({ message: "Користувача не знайдено" });
  }
});

module.exports = router;

module.exports = router;
