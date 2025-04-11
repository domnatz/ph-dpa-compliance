const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import API handlers
const registerHandler = require('./api/users/register');
const loginHandler = require('./api/users/login');
const meHandler = require('./api/users/me');
const assessmentsHandler = require('./api/assessments/index');
const tasksHandler = require('./api/assessments/task');

// Create a separate variable for the task ID handler with the CORRECT path
const taskIdHandler = require('./api/assessments/tasks[id].js');  // Note: no slash before [id]

// Create Express handler for serverless functions
const createHandler = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Mount API routes
app.post('/api/users/register', createHandler(registerHandler));
app.post('/api/users/login', createHandler(loginHandler));
app.get('/api/users/me', createHandler(meHandler));
app.options('/api/users/me', createHandler(meHandler));

// Use the variable instead of directly requiring the file with brackets
app.put('/api/assessments/tasks/:id', createHandler(taskIdHandler));
app.options('/api/assessments/tasks/:id', createHandler(taskIdHandler));

app.get('/api/assessments', createHandler(assessmentsHandler));
app.post('/api/assessments', createHandler(assessmentsHandler));
app.options('/api/assessments', createHandler(assessmentsHandler));
app.get('/api/assessments/tasks', createHandler(tasksHandler));
app.post('/api/assessments/tasks', createHandler(tasksHandler));
app.options('/api/assessments/tasks', createHandler(tasksHandler));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));