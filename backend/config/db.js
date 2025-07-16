// IskraDatingApp/backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // process.env.MONGO_URI буде доступний, оскільки dotenv.config() вже спрацював у server.js
        console.log('Attempting to connect to MongoDB with URI:', process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useCreateIndex: true, // Deprecated in Mongoose 6+
            // useFindAndModify: false // Deprecated in Mongoose 6+
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        // Вийти з процесу з помилкою, якщо підключення до БД не вдалося
        process.exit(1); 
    }
};

module.exports = connectDB;
