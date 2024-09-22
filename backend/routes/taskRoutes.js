// routes/taskRoutes.js

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/authMiddleware');

// Create a new task
router.post('/create', authenticateToken, taskController.createTask);

// Get all tasks
router.get('/', authenticateToken, taskController.getTasks);

// Update task by ID
router.put('/:id', authenticateToken, taskController.updateTask);

// Delete task by ID
router.delete('/:id', authenticateToken, taskController.deleteTask);

router.get('/:id',authenticateToken, taskController.getTaskById);
router.get('/get/today', authenticateToken, taskController.getTodayEvents);


module.exports = router;
