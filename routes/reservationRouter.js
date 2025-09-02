const Router = require('express')
const router = new Router()
const reservationController = require('../controllers/reservationController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/reserve', authMiddleware, reservationController.reserve);
router.post('/unreserve', authMiddleware, reservationController.unreserve);
router.get('/my-reservations', authMiddleware, reservationController.getReservationsByUser);


module.exports = router