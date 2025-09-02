const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')


router.post('/registration', userController.registration)
router.post('/login', userController.login)
router.get('/auth/:id', userController.getUserProfile)
router.put('/auth/:id', userController.update)

router.get('/refresh', userController.refreshToken);
// router.post('/refresh', userController.refresh);

module.exports = router