const { Sequelize } = require('sequelize');
const pg = require('pg'); // 👈 важно для Vercel

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // нужно для Supabase
    },
  },
  logging: false,
});

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