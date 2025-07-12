// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        select: false // Не повертати пароль при запитах, якщо явно не вказано
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
    // Можна додати інші поля: username, profileData, telegramId тощо
});

// Middleware для хешування пароля перед збереженням
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Метод для порівняння введеного пароля з хешованим
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
