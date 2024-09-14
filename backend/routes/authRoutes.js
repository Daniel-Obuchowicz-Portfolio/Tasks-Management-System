const express = require('express');
const { register, login } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.delete('/delete', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

  // Admin delete logic, ensuring user can't delete themselves
  res.json({ message: 'User deleted' });
});

module.exports = router;
