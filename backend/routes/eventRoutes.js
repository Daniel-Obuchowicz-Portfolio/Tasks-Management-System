const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/eventController');
const authenticateToken = require('../middleware/authMiddleware');

// Define routes for calendar events
router.post('/', authenticateToken, calendarController.createEvent);
router.get('/', authenticateToken, calendarController.getEvents);
router.get('/by/:id', authenticateToken, calendarController.getEventById);
router.put('/:id', authenticateToken, calendarController.updateEvent);
router.delete('/:id', authenticateToken, calendarController.deleteEvent);

module.exports = router;
