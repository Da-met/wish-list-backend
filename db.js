const { Sequelize } = require('sequelize');
const pg = require('pg'); // 👈 явное подключение pg

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectModule: pg, // 👈 заставляем использовать pg
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // важно для Supabase на Vercel
      },
    },
    logging: false, // отключаем лишние логи
  }
);

module.exports = sequelize;



// const {Sequelize} = require('sequelize')

// module.exports = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         dialect: 'postgres',
//         host: process.env.DB_HOST,
//         port: process.env.DB_PORT,
//         dialectOptions: {
//             ssl: {
//                 require: true,
//                 rejectUnauthorized: false, 
//             },
//         },
//         logging: false, 
//     }
// )