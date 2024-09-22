// controllers/taskController.js
const express = require('express');
const db = require('../config/db'); // Make sure you have your database connection in this file

const getTodayDate = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Create a new task
exports.createTask = (req, res) => {
  const {
    title,
    description,
    status,
    assignedUsers,
    priority,
    dueDate
  } = req.body;

  // Define valid statuses based on your database column definition
  const validStatuses = ['open', 'in-progress', 'completed'];

  // Ensure the status is one of the valid options
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      message: 'Invalid status value. Allowed values are open, in-progress, or completed.'
    });
  }

  // Convert assignedUsers array to JSON format
  const assignedUsersJson = JSON.stringify(assignedUsers);

  // Ensure all required fields are present
  if (!title || !description || !status || !priority || !dueDate) {
    return res.status(400).json({
      message: 'All fields are required'
    });
  }

  // SQL query to insert the task
  const query = `
      INSERT INTO tasks (title, description, status, assignedUsers, priority, dueDate, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

  // Execute the query
  db.query(query, [title, description, status, assignedUsersJson, priority, dueDate], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error creating task',
        error: err
      });
    }
    res.status(201).json({
      message: 'Task created successfully',
      taskId: result.insertId
    });
  });
};



// Get all tasks
exports.getTasks = (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default page is 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default limit is 10 if not provided
  const offset = (page - 1) * limit; // Calculate the offset for SQL

  const countQuery = 'SELECT COUNT(*) as total FROM tasks'; // Query to count total tasks
  const query = `SELECT * FROM tasks LIMIT ${limit} OFFSET ${offset}`; // Query to get paginated tasks

  // Get total task count
  db.query(countQuery, (err, countResult) => {
    if (err) {
      return res.status(500).json({
        message: 'Error fetching task count',
        error: err
      });
    }

    const totalTasks = countResult[0].total;
    const totalPages = Math.ceil(totalTasks / limit);

    // Get paginated tasks
    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({
          message: 'Error fetching tasks',
          error: err
        });
      }

      res.status(200).json({
        tasks: results,
        currentPage: page,
        totalPages: totalPages,
        totalTasks: totalTasks,
      });
    });
  });
};


exports.updateTask = (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, assignedUsers, dueDate } = req.body;

  // Check if all required fields are provided
  if (!title || !description || !status || !priority || !dueDate || !assignedUsers) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Zamień tablicę assignedUsers na poprawny format JSON
  const assignedUsersJson = JSON.stringify(assignedUsers.map(user => Number(user)));

  // SQL query to update the task
  const query = `UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assignedUsers = ?, dueDate = ? WHERE id = ?`;

  // Execute the query with the provided values
  db.query(query, [title, description, status, priority, assignedUsersJson, dueDate, id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error updating task',
        error: err
      });
    }

    // If no rows were affected, the task ID does not exist
    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    // Send success response
    res.status(200).json({
      message: 'Task updated successfully'
    });
  });
};




// Delete task
exports.deleteTask = (req, res) => {
  const taskId = req.params.id;

  const query = 'DELETE FROM tasks WHERE id = ?';

  db.query(query, [taskId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: 'Error deleting task',
        error: err
      });
    }
    res.status(200).json({
      message: 'Task deleted successfully'
    });
  });
};

// Pobieranie pojedynczego zadania po ID
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
      return res.status(500).json({
        message: 'Error fetching task details',
        error: err
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: 'Task not found'
      });
    }

    const task = results[0];
    task.assignedUsernames = task.assignedUsernames ? task.assignedUsernames.split(',') : [];

    res.status(200).json(task);
  });
};

exports.getTodayEvents = (req, res) => {
  const today = getTodayDate(); // Assuming this function is already defined and returns today's date in 'YYYY-MM-DD' format.
  const userId = req.user.id; // Get the ID of the logged-in user from JWT token.

  console.log(today);

  // Corrected SQL query to get today's events based on user ID and date.
  const query = `
    SELECT id, title, description, date, createdAt 
    FROM events 
    WHERE date LIKE ? AND (userIds LIKE ? OR userIds IS NULL)
  `;

  // `%userId%` ensures we match the user ID within the string of `userIds`.
  const userFilter = `%${userId}%`;

  db.query(query, [`${today}%`, userFilter], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error fetching today's events",
        error: err
      });
    }

    // If events are found, return them.
    if (results.length > 0) {
      return res.status(200).json(results);
    }

    // If no events are found, return an empty list.
    res.status(200).json([]);
  });
};

