const db = require('../config/db');
const bcrypt = require('bcrypt');

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  const userRole = req.user.role; // Assuming `req.user` contains the logged-in user information

  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

// Get all users (accessible to admins)
exports.getUsers = (req, res) => {
  const userId = req.user.id; // Assuming req.user contains the logged-in user's information
  const userRole = req.user.role; // Assuming req.user contains the role (e.g., 'admin', 'user')

  let query;
  let queryParams = [];

  if (userRole === 'admin') {
    // Admin can see all users
    query = 'SELECT id, username, role FROM users';
  } else {
    // Regular users can only see their own information
    query = 'SELECT id, username, role FROM users WHERE id = ?';
    queryParams.push(userId); // Only return the logged-in user's details
  }

  db.query(query, queryParams, (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching users', error: err });

    res.status(200).json(results);
  });
};


// Update a user (Admin only)
exports.updateUser = (req, res) => {
  const { firstName, lastName, email, username, role, dob } = req.body;
  const formattedDob = new Date(dob).toISOString().split('T')[0]; // Convert the date to 'YYYY-MM-DD'
  
  const loggedInUserId = req.user.id; // Assuming `req.user` contains the logged-in user's information
  const loggedInUserRole = req.user.role; // Assuming `req.user` contains the role (e.g., 'admin', 'user')
  const userId = req.params.id; // The user ID being updated

  let query;
  let queryParams;

  if (loggedInUserRole === 'admin') {
    // Admins can update all user details, including the role
    query = `
      UPDATE users 
      SET firstName = ?, lastName = ?, email = ?, username = ?, role = ?, dob = ? 
      WHERE id = ?
    `;
    queryParams = [firstName, lastName, email, username, role, formattedDob, userId];
  } else {
    // Non-admin users can only update their own profile, and cannot update their role
    if (loggedInUserId !== parseInt(userId)) {
      return res.status(403).json({ message: 'Access denied. You can only update your own profile.' });
    }

    // Update without changing the role
    query = `
      UPDATE users 
      SET firstName = ?, lastName = ?, email = ?, username = ?, dob = ? 
      WHERE id = ?
    `;
    queryParams = [firstName, lastName, email, username, formattedDob, userId];
  }

  db.query(query, queryParams, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating user', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  });
};


// Delete a user (Admin only)
exports.deleteUser = [isAdmin, (req, res) => {
  const { id } = req.params;

  // Prevent users from deleting themselves
  if (id == req.user.id) {
    return res.status(403).json({ message: 'You cannot delete yourself!' });
  }

  db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error deleting user' });
    res.json({ message: 'User deleted successfully' });
  });
}];

// Get a user by ID (accessible to admins)
exports.getUserById = (req, res) => {
  const userId = req.params.id; // The ID of the user being fetched
  const loggedInUserId = req.user.id; // The ID of the logged-in user
  const loggedInUserRole = req.user.role; // The role of the logged-in user

  // Check if the user is an admin or if they are requesting their own details
  if (loggedInUserRole !== 'admin' && loggedInUserId !== parseInt(userId)) {
    return res.status(403).json({ message: 'Access denied. You can only view your own profile.' });
  }

  const query = `
    SELECT id, username, email, role, dob, created_at, firstName, lastName 
    FROM users 
    WHERE id = ?
  `;

  db.query(query, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching user' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result[0]);
  });
};

// Register a new user (Admin only)
exports.registerUserByAdmin = [isAdmin, (req, res) => {
  const { firstName, lastName, email, username, password, role, dob } = req.body;

  if (!firstName || !lastName || !email || !username || !password || !role || !dob) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = `
    INSERT INTO users (firstName, lastName, email, username, password, role, dob, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(query, [firstName, lastName, email, username, hashedPassword, role, dob], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error registering user', error: err });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
}];

// Search users (open to all authenticated users)
exports.searchUsers = (req, res) => {
  const searchQuery = req.query.q;

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const query = `SELECT id, username FROM users WHERE LOWER(username) LIKE ? LIMIT 10`;
  const searchValue = `%${searchQuery.toLowerCase()}%`;

  db.query(query, [searchValue], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching users', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(results);
  });
};

// Fetch user details by IDs (open to all authenticated users)
exports.getUsersByIds = (req, res) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ message: 'Invalid userIds' });
  }

  const query = `SELECT id, username FROM users WHERE id IN (?)`;

  db.query(query, [userIds], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching users', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No users found for the provided IDs' });
    }

    res.status(200).json(results);
  });
};
