const express = require('express');
const db = require('../config/db'); // Database connection

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  const userRole = req.user.role; // Assuming `req.user` contains the logged-in user information

  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Create a new task - Admin only
exports.createTask = [isAdmin, (req, res) => {
  const { title, description, status, assignedUsers, priority, dueDate } = req.body;

  const validStatuses = ['open', 'in-progress', 'completed'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value. Allowed values are open, in-progress, or completed.' });
  }

  const assignedUsersJson = JSON.stringify(assignedUsers);

  if (!title || !description || !status || !priority || !dueDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = `
    INSERT INTO tasks (title, description, status, assignedUsers, priority, dueDate, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(query, [title, description, status, assignedUsersJson, priority, dueDate], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error creating task', error: err });
    }
    res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
  });
}];

// Get all tasks (admin gets all tasks, users get only their tasks)
exports.getTasks = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const userId = req.user.id; // Assuming req.user contains the logged-in user information
  const userRole = req.user.role; // Assuming req.user contains the role (e.g., 'admin', 'user')

  let countQuery;
  let query;

  if (userRole === 'admin') {
    // Admin can see all tasks
    countQuery = 'SELECT COUNT(*) as total FROM tasks';
    query = `SELECT * FROM tasks LIMIT ${limit} OFFSET ${offset}`;
  } else {
    // Regular users can only see their assigned tasks
    countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE JSON_CONTAINS(assignedUsers, JSON_ARRAY(?), "$")';
    query = `SELECT * FROM tasks WHERE JSON_CONTAINS(assignedUsers, JSON_ARRAY(?), "$") LIMIT ${limit} OFFSET ${offset}`;
  }

  // Execute count query first to get the total number of tasks
  db.query(countQuery, [userId], (err, countResult) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching task count', error: err });
    }

    const totalTasks = countResult[0].total;
    const totalPages = Math.ceil(totalTasks / limit);

    // Now execute the query to get the tasks
    db.query(query, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Error fetching tasks', error: err });
      }

      res.status(200).json({ 
        tasks: results, 
        currentPage: page, 
        totalPages: totalPages, 
        totalTasks: totalTasks 
      });
    });
  });
};

// Update task - Admin only
exports.updateTask = [isAdmin, (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assignedUsers, dueDate } = req.body;

  if (!title || !description || !status || !priority || !dueDate || !assignedUsers) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const assignedUsersJson = JSON.stringify(assignedUsers.map(user => Number(user)));

  const query = `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assignedUsers = ?, dueDate = ? WHERE id = ?`;

  db.query(query, [title, description, status, priority, assignedUsersJson, dueDate, id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error updating task', error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully' });
  });
}];

// Delete task - Admin only
exports.deleteTask = [isAdmin, (req, res) => {
  const taskId = req.params.id;

  const query = 'DELETE FROM tasks WHERE id = ?';

  db.query(query, [taskId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting task', error: err });
    }
    res.status(200).json({ message: 'Task deleted successfully' });
  });
}];

// Get a single task by ID (accessible to all roles)
exports.getTaskById = (req, res) => {
  const taskId = req.params.id;

  const query = `
    SELECT tasks.*,
          GROUP_CONCAT(u.username) AS assignedUsernames,
          GROUP_CONCAT(u.id) AS assignedUserIds
    FROM tasks
    LEFT JOIN users u ON JSON_CONTAINS(
        CONCAT('[', REPLACE(REPLACE(tasks.assignedUsers, '[', ''), ']', ''), ']'), 
        CAST(u.id AS CHAR), '$')
    WHERE tasks.id = ?
    GROUP BY tasks.id;
  `;

  db.query(query, [taskId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Error fetching task details', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = results[0];
    task.assignedUsernames = task.assignedUsernames ? task.assignedUsernames.split(',') : [];

    res.status(200).json(task);
  });
};

// Get today's events for a user (accessible to all roles)
exports.getTodayEvents = (req, res) => {
  const today = getTodayDate();
  const userId = req.user.id; 

  const query = `
    SELECT id, title, description, date, createdAt 
    FROM events 
    WHERE date LIKE ? AND (userIds LIKE ? OR userIds IS NULL)
  `;

  const userFilter = `%${userId}%`;

  db.query(query, [`${today}%`, userFilter], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching today's events", error: err });
    }

    if (results.length > 0) {
      return res.status(200).json(results);
    }

    res.status(200).json([]);
  });
};
