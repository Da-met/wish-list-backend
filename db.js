const {Sequelize} = require('sequelize')

module.exports = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // важно для Supabase
            },
        },
        logging: false, // отключаем лишние логи
        // dialectModuleOptions: {
        //     family: 6 // используем IPv6
        // }
    }
)