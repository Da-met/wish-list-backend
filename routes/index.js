const express = require('express');
const sequelize = require('../db'); // 👈 ДОБАВЬТЕ ЭТУ СТРОЧКУ

const router = express.Router();

const Router = require('express')
// const router = new Router()

const userRouter = require('./userRouter')
const wishRouter = require('./wishRouter')
const reservationRouter = require('./reservationRouter')
const subscriptionRouter = require('./subscriptionRouter')

const listRouter = require('./listRouter')


// health
router.get('/health', async (req, res) => {
  try {
    console.log('Health check started');
    
    // Проверяем, что sequelize определен
    if (!sequelize) {
      throw new Error('Sequelize is not defined');
    }
    
    await sequelize.authenticate();
    console.log('DB authentication successful');
    
    // Простой запрос к БД
    const [result] = await sequelize.query('SELECT NOW() as current_time');
    
    res.json({ 
      ok: true, 
      msg: 'DB OK',
      current_time: result[0].current_time,
      database: 'connected'
    });
    
  } catch (e) {
    console.error('Health check failed:', e);
    res.status(500).json({ 
      ok: false, 
      error: e.message,
      details: 'Sequelize connection failed'
    });
  }
});

// Диагностический эндпоинт
router.get('/debug', (req, res) => {
  res.json({
    db_host: process.env.DB_HOST,
    db_name: process.env.DB_NAME,
    db_user: process.env.DB_USER,
    database_url: process.env.DATABASE_URL ? 'set' : 'not set',
    node_env: process.env.NODE_ENV
  });
});

router.use('/user', userRouter)
router.use('/wish', wishRouter)
router.use('/reservation', reservationRouter)
router.use('/subscription', subscriptionRouter)

router.use('/lists', listRouter)
// router.use('/sheet', listRouter)
module.exports = router