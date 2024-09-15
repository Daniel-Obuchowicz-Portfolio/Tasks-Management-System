const express = require('express');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const eventRoutes = require('./routes/eventRoutes');
const app = express();

app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/events', eventRoutes); 

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
