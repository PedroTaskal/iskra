// backend/models/User.js
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs'); // Більше не потрібен, якщо не хешуємо

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
        // select: false // Можна прибрати, якщо пароль не хешується і ви хочете його повертати за замовчуванням
                        // Або залишити, якщо не хочете, щоб він повертався при звичайних запитах
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// !!! УВАГА: ЗАКОМЕНТОВАНО/ВИДАЛЕНО ЛОГІКУ ХЕШУВАННЯ ПАРОЛІВ !!!
// UserSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
// });

// !!! УВАГА: ЗАКОМЕНТОВАНО/ВИДАЛЕНО МЕТОД ПОРІВНЯННЯ ХЕШОВАНИХ ПАРОЛІВ !!!
// UserSchema.methods.matchPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model('User', UserSchema);
