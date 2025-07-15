// IskraDatingApp/backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Імпортуємо bcryptjs

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Будь ласка, вкажіть адресу електронної пошти'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Будь ласка, вкажіть дійсну адресу електронної пошти'
        ]
    },
    password: {
        type: String,
        required: [true, 'Будь ласка, вкажіть пароль'],
        minlength: [6, 'Пароль повинен бути не менше 6 символів'],
        select: false // Не повертати пароль при звичайних запитах, якщо явно не вказано
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    // Можна додати інші поля: username, profileData, telegramId тощо
});

// Middleware для хешування пароля перед збереженням
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) { // Якщо пароль не змінювався, не хешуємо повторно
        next();
    }
    const salt = await bcrypt.genSalt(10); // Генеруємо сіль
    this.password = await bcrypt.hash(this.password, salt); // Хешуємо пароль
    next();
});

// Метод для порівняння введеного пароля з хешованим
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // Порівнюємо введений пароль з хешованим паролем користувача
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
