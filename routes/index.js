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

router.get('/check-db', async (req, res) => {
  try {
    const [tables] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('users', 'lists', 'wishes', 'reservations', 'subscriptions')
    `);
    
    const tableNames = tables.map(t => t.table_name);
    res.json({
      tables: tableNames,
      all_tables_exist: tableNames.length === 5,
      status: tableNames.length === 5 ? 'ready' : 'missing_tables'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.use('/user', userRouter)
router.use('/wish', wishRouter)
router.use('/reservation', reservationRouter)
router.use('/subscription', subscriptionRouter)

router.use('/lists', listRouter)
// router.use('/sheet', listRouter)
module.exports = router