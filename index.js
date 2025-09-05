

require('dotenv').config();

const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')
const express = require('express');
// const PORT = process.env.PORT || 5000;

const cookieParser = require('cookie-parser'); // ← подключаешь

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
app.use(express.static(path.resolve(__dirname, 'static')))


// Middleware для обработки файлов
app.use(fileUpload());
// app.use(fileUpload({}))
app.use(express.urlencoded({ extended: true }));
app.use('/api', router)

// ОБРАБОТКА ОШИБОК, ПОСЛЕДНИЙ MIDDLEWARE
app.use(errorHandler)



const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        // app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
        console.log('✅ DB connected successfully');
    } catch (error) {
        console.log('ERROR!!!!!!!!!!',error)
    }
}

start()

// Запускаем только локально
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

// Для Vercel — экспортируем app
module.exports = app;

// sequelize.sync({ alter: true })
//   .then(() => {
//      console.log("Database synchronized successfully.");
//   })
//   .catch((error) => {
//      console.error("Error synchronizing the database:", error);
// })