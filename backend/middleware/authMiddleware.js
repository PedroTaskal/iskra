const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Можливо, знадобиться для перевірки користувача

const protect = async (req, res, next) => {
    let token;

    // Токен зазвичай передається в заголовках (headers)
    // у форматі "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Витягуємо токен з заголовка
            token = req.headers.authorization.split(' ')[1];

            // 2. Перевіряємо (верифікуємо) токен
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Можна додати користувача до об'єкту запиту (req),
            // щоб мати до нього доступ в наступних маршрутах
            req.user = await User.findById(decoded.id).select('-password');

            // 3. Якщо токен валідний, пропускаємо до наступного обробника
            next();

        } catch (error) {
            console.error('Помилка автентифікації:', error.message);
            res.status(401).json({ message: 'Немає авторизації, токен недійсний' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Немає авторизації, токен відсутній' });
    }
};

module.exports = { protect };