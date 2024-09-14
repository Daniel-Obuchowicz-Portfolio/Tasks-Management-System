const db = require('../config/db');
const bcrypt = require('bcrypt');

// Get all users
exports.getUsers = (req, res) => {
  db.query('SELECT id, username, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching users' });
    res.json(results);
  });
};

// Update a user (Admin)
// Update user details by ID
exports.updateUser = (req, res) => {
  const { firstName, lastName, email, username, role, dob } = req.body;

  // Konwertuj datę z formatu ISO na 'YYYY-MM-DD'
  const formattedDob = new Date(dob).toISOString().split('T')[0];

  const query = `
    UPDATE users 
    SET firstName = ?, lastName = ?, email = ?, username = ?, role = ?, dob = ? 
    WHERE id = ?
  `;
  
  const userId = req.params.id;

  db.query(query, [firstName, lastName, email, username, role, formattedDob, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating user', error: err });
    }
    res.status(200).json({ message: 'User updated successfully' });
  });
};



// Delete a user (Admin only)
exports.deleteUser = (req, res) => {
  const { id } = req.params;

  // Prevent users from deleting themselves
  if (id == req.user.id) {
    return res.status(403).json({ message: 'You cannot delete yourself!' });
  }

  db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error deleting user' });
    res.json({ message: 'User deleted successfully' });
  });
};

exports.getUserById = (req, res) => {
  const userId = req.params.id; // Get user ID from the request params

  const query = 'SELECT id, username, email, role, dob, created_at, firstName, lastName FROM users WHERE id = ?';

  db.query(query, [userId], (err, result) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ message: 'Error fetching user' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result[0]); // Return the user details as JSON
  });
};

exports.registerUserByAdmin = (req, res) => {
  const { firstName, lastName, email, username, password, role, dob } = req.body;

  // Validate that all required fields are provided
  if (!firstName || !lastName || !email || !username || !password || !role || !dob) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Hash the password for security
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Prepare the SQL query to insert the user data into the database
  const query = `
    INSERT INTO users (firstName, lastName, email, username, password, role, dob, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  // Execute the query and handle any potential errors
  db.query(query, [firstName, lastName, email, username, hashedPassword, role, dob], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error registering user', error: err });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
};

// Search users based on a query parameter
exports.searchUsers = (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    console.log('No search query provided');
    return res.status(400).json({ message: 'Search query is required' });
  }

  const query = `SELECT id, username FROM users WHERE LOWER(username) LIKE ? LIMIT 10`;
  const searchValue = `%${searchQuery.toLowerCase()}%`;

  console.log(`Running query: ${query} with value: ${searchValue}`);

  db.query(query, [searchValue], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Error fetching users', error: err });
    }

    console.log('Query results:', results);
    if (results.length === 0) {
      console.log('No users found');
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(results);
  });
};
