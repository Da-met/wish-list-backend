const Router = require('express')
const router = new Router()
const subscriptionController = require('../controllers/subscriptionController')

router.post('/add', subscriptionController.add)
router.get('/:id', subscriptionController.getAllFriends)
router.delete('/delete/:userId/:subscriptionId', subscriptionController.delete)



module.exports = router