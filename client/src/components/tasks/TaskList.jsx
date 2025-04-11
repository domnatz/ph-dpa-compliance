import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import TaskItem from './TaskItem';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tasks');
      setTasks(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading tasks...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        {error}
      </div>
    );
  }

  // Function to generate sample tasks if none exist
  const generateSampleTasks = async () => {
    try {
      setLoading(true);
      await api.post('/tasks/generate');
      fetchTasks();
    } catch (error) {
      console.error('Error generating tasks:', error);
      setError('Failed to generate tasks');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Compliance Tasks</h2>
        {tasks.length === 0 && (
          <button 
            onClick={generateSampleTasks}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
          >
            Generate Tasks
          </button>
        )}
      </div>

      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskItem 
              key={task._id} 
              task={task} 
              refreshTasks={fetchTasks}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-lg mb-4">No tasks available. Generate tasks or complete an assessment.</p>
          <div className="flex space-x-4 justify-center">
            <button
              onClick={generateSampleTasks}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition"
            >
              Generate Sample Tasks
            </button>
            <Link to="/assessment" className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark transition">
              Take Assessment
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;