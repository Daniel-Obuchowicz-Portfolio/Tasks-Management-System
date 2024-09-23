const db = require('../config/db'); // Ensure you have your database connection

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  const userRole = req.user.role; // Assuming `req.user` contains the logged-in user information

  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

// Create a new event with multiple users (comma-separated user IDs) - Admin Only
// Create an event (admin only)
exports.createEvent = [isAdmin, (req, res) => {
  const { title, description, date, userIds } = req.body;  // userIds is an array

  if (!title || !date || !userIds || userIds.length === 0) {
    return res.status(400).json({ message: 'Title, date, and userIds are required' });
  }

  const userIdsString = Array.isArray(userIds) ? userIds.join(',') : userIds;

  const query = `
    INSERT INTO events (title, description, date, userIds)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [title, description, date, userIdsString], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating event', error: err });
    }
    res.status(201).json({
      message: 'Event created successfully',
      eventId: result.insertId
    });
  });
}];

// Get all events (admin sees all, user sees only their assigned events)
exports.getEvents = (req, res) => {
  const userId = req.user.id; // Get logged-in user's ID
  const userRole = req.user.role; // Get logged-in user's role

  let query;
  let queryParams = [];

  if (userRole === 'admin') {
    // Admin can see all events
    query = 'SELECT id, title, description, date, userIds, createdAt FROM events';
  } else {
    // Regular users can only see events they are assigned to
    query = `
      SELECT id, title, description, date, userIds, createdAt 
      FROM events 
      WHERE FIND_IN_SET(?, userIds)
    `;
    queryParams.push(userId);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching events', error: err });
    }

    res.status(200).json(results);
  });
};

// Get a single event by ID (admin can access any event, user can only access events they're assigned to)
exports.getEventById = (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  let query;
  let queryParams = [id];

  if (userRole === 'admin') {
    // Admin can see any event
    query = 'SELECT id, title, description, date, userIds, createdAt FROM events WHERE id = ?';
  } else {
    // Regular users can only see events they're assigned to
    query = `
      SELECT id, title, description, date, userIds, createdAt 
      FROM events 
      WHERE id = ? AND FIND_IN_SET(?, userIds)
    `;
    queryParams.push(userId);
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching event', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(results[0]);
  });
};

// Update an event (admin only)
exports.updateEvent = [isAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, date, userIds } = req.body;

  if (!title || !date || !userIds) {
    return res.status(400).json({ message: 'Title, date, and userIds are required' });
  }

  const query = 'UPDATE events SET title = ?, description = ?, date = ?, userIds = ? WHERE id = ?';

  db.query(query, [title, description, date, userIds, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating event', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event updated successfully' });
  });
}];

// Delete an event (admin only)
exports.deleteEvent = [isAdmin, (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM events WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting event', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json({ message: 'Event deleted successfully' });
  });
}];

