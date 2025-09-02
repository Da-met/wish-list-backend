const Router = require('express')
const router = new Router()
const listController = require('../controllers/listController')

router.post( '/add', listController.createList )

router.get( '/user/:id', listController.getAllLists )
router.get('/:id', listController.getListById);

router.put('/:id', listController.updateList);
router.delete('/:id', listController.deleteList);


module.exports = router



// router.post('/friends/add', subscriptionController.add)
// router.get('/friends/:id', subscriptionController.getAllFriends)
// router.delete('/friends/delete/:userId/:subscriptionId', subscriptionController.delete)
