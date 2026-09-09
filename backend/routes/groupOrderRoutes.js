const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createGroupOrder,
  joinGroupOrder,
  getGroupOrder,
  addItemToGroup,
  removeItemFromGroup,
  finalizeGroupOrder,
} = require('../controllers/groupOrderController');

router.use(protect);

router.post('/create', createGroupOrder);
router.post('/join', joinGroupOrder);
router.get('/:groupCode', getGroupOrder);
router.post('/:groupCode/items', addItemToGroup);
router.delete('/:groupCode/items/:itemId', removeItemFromGroup);
router.post('/:groupCode/finalize', finalizeGroupOrder);

module.exports = router;
