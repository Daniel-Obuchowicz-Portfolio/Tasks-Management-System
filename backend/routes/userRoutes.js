const express = require('express');
const { getUsers, updateUser, deleteUser, getUserById, registerUserByAdmin, searchUsers } = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');  // Import the authentication middleware
const router = express.Router();

// Route to fetch all users (protected)
router.get('/', authenticateToken, getUsers);

// Route to update user (protected)
router.put('/:id', authenticateToken, updateUser);

// Route to delete user (protected)
router.delete('/:id', authenticateToken, deleteUser);

router.get('/by/:id', authenticateToken, getUserById);  // You can include middleware for authentication
router.post('/create', authenticateToken, registerUserByAdmin);  // You can include middleware for authentication
router.get('/search', authenticateToken, searchUsers);


module.exports = router;
