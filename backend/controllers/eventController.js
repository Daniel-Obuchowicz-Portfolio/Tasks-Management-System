const db = require('../config/db'); // Ensure you have your database connection

// Create a new event with multiple users (comma-separated user IDs)
exports.createEvent = (req, res) => {
  const { title, description, date, userIds } = req.body;  // userIds is an array

  // Ensure all required fields are present
  if (!title || !date || !userIds || userIds.length === 0) {
    return res.status(400).json({ message: 'Title, date, and userIds are required' });
  }

  // Convert userIds array to a comma-separated string
  const userIdsString = Array.isArray(userIds) ? userIds.join(',') : userIds;

  // SQL query to insert the event
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
};



// Get all events with user IDs (comma-separated string)
exports.getEvents = (req, res) => {
  const query = 'SELECT id, title, description, date, userIds, createdAt FROM events';

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching events', error: err });
    }

    res.status(200).json(results);
  });
};

// Get a single event by ID (comma-separated user IDs)
exports.getEventById = (req, res) => {
  const { id } = req.params;

  const query = 'SELECT id, title, description, date, userIds, createdAt FROM events WHERE id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching event', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.status(200).json(results[0]);
  });
};

// Update an event with multiple user IDs (comma-separated string)
exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const { title, description, date, userIds } = req.body;  // userIds is a comma-separated string

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
};

// Delete an event by ID
exports.deleteEvent = (req, res) => {
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
};
