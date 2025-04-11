import React, { useState } from 'react';
import api from '../../utils/api';

const TaskItem = ({ task, refreshTasks }) => {
  const [isCompleted, setIsCompleted] = useState(task.completed);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCompleted = async () => {
    try {
      setIsUpdating(true);
      const newStatus = !isCompleted;
      
      // Update UI immediately for better user experience
      setIsCompleted(newStatus);
      
      // Send update to API
      await api.put(`/tasks/${task._id}`, {
        completed: newStatus
      });
      
      // Optionally refresh the full task list
      if (refreshTasks) refreshTasks();
      
    } catch (error) {
      // Revert UI change if API call fails
      console.error('Failed to update task:', error);
      setIsCompleted(!newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 mb-4 border-l-4 ${isCompleted ? 'border-green-500' : 'border-yellow-500'}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-1">
          <input
            type="checkbox"
            checked={isCompleted}
            onChange={toggleCompleted}
            disabled={isUpdating}
            className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
          />
        </div>
        <div className="ml-3">
          <h3 className={`text-lg font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}>
            {task.text}
          </h3>
          <p className={`mt-1 text-sm ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
            {task.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;