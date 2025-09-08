const Router = require('express')
const router = new Router()

const userRouter = require('./userRouter')
const wishRouter = require('./wishRouter')
const reservationRouter = require('./reservationRouter')
const subscriptionRouter = require('./subscriptionRouter')

const listRouter = require('./listRouter')


// health
router.get('/health', async (req, res) => {
    try {
      await sequelize.authenticate();
      res.json({ ok: true, msg: 'DB OK' });
    } catch (e) {
      console.error('Health DB error:', e && e.stack ? e.stack : e);
      res.status(500).json({ ok: false, error: e.message });
    }
});

router.use('/user', userRouter)
router.use('/wish', wishRouter)
router.use('/reservation', reservationRouter)
router.use('/subscription', subscriptionRouter)

router.use('/lists', listRouter)
// router.use('/sheet', listRouter)
module.exports = router