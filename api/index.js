

require('dotenv').config();
const express = require('express');
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')

const sequelize = require('../db')
const models = require('../models/models')
const router = require('../routes/index')
const errorHandler = require('../middleware/ErrorHandlingMiddleware')


// const PORT = process.env.PORT || 5000;

const app = express();

const allowedOrigins = [
    'http://localhost:5173',   // фронт локально
    'https://vishy.vercel.app' // фронт на Vercel
];

app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

// Обработка preflight-запросов
app.options('*', cors());

app.use(cookieParser()); 

app.use(express.json({limit: "10mb", extended: true}));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, 'static')))
// Middleware для обработки файлов
app.use(fileUpload());


app.get('/', (req, res) => {
  res.send('✅ Backend is running!');
});

// API роуты
app.use('/api', router)

// ОБРАБОТКА ОШИБОК, ПОСЛЕДНИЙ MIDDLEWARE
app.use(errorHandler)


// Функция для старта сервера и подключения к БД
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ DB connected successfully');
  } catch (error) {
    console.error('❌ DB connection error:', error);
  }
};

// Локальная разработка — слушаем порт
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  startServer().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  });
}

// Для Vercel — просто экспортируем app
module.exports = app;



// sequelize.sync({ alter: true })
//   .then(() => {
//      console.log("Database synchronized successfully.");
//   })
//   .catch((error) => {
//      console.error("Error synchronizing the database:", error);
// })