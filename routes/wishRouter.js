const Router = require('express');
const router = new Router();
const wishController = require('../controllers/wishController');

router.post( '/', wishController.create );
router.get( '/',  wishController.getAll );
router.get('/:id', wishController.getOne);

router.get('/list/:listId', wishController.getWishesByListId);

router.put('/:id', wishController.update);
router.delete('/:id', wishController.delete);

router.get('/by-list/:listId', wishController.getWishesByListId);

router.patch('/:id/completed', wishController.setCompleted);

module.exports = router;