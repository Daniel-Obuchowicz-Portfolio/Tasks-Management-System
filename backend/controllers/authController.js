const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.register = (req, res) => {
  console.log(req.body);  // Log the request body

  const { firstName, lastName, email, dob, username, password } = req.body;

  if (!firstName || !lastName || !email || !dob || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insert user into the database
  const query = 'INSERT INTO users (firstName, lastName, email, dob, username, password) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [firstName, lastName, email, dob, username, hashedPassword], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error registering user', error: err });
    }
    res.status(201).json({ message: email });
  });
};


exports.login = (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });

    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
};
