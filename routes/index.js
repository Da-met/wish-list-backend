const Router = require('express')
const router = new Router()

const userRouter = require('./userRouter')
const wishRouter = require('./wishRouter')
const reservationRouter = require('./reservationRouter')
const subscriptionRouter = require('./subscriptionRouter')

const listRouter = require('./listRouter')


router.use('/user', userRouter)
router.use('/wish', wishRouter)
router.use('/reservation', reservationRouter)
router.use('/subscription', subscriptionRouter)

router.use('/lists', listRouter)
// router.use('/sheet', listRouter)
module.exports = router