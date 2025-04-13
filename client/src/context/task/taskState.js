import React, { useReducer } from 'react';
import axios from 'axios';
import TaskContext from './taskContext';
import taskReducer from './taskReducer';
import {
  GET_TASKS,
  UPDATE_TASK,
  TASK_ERROR,
  CLEAR_ERRORS,
} from '../types';

const TaskState = (props) => {
  const initialState = {
    tasks: [],
    error: null,
    loading: false,
  };

  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Get all tasks
  const getTasks = async () => {
    try {
     
      const res = await axios.get('/api/assessments/task');
      

      dispatch({
        type: GET_TASKS,
        payload: res.data.data,
      });
    } catch (err) {
      console.error('Error fetching tasks:', err.response?.data || err.message);
      dispatch({
        type: TASK_ERROR,
        payload: err.response?.data?.error || 'Error fetching tasks',
      });
    }
  };

  // Toggle task completion status
  const toggleTask = async (taskId) => {
    try {
      

      // Find the current task in the state
      const currentTask = state.tasks.find((task) => String(task._id) === String(taskId));
      if (!currentTask) {
        console.error(`Task with ID ${taskId} not found in state`);
        return;
      }

      // Send request to toggle completion status
      const res = await axios.post('/api/assessments/task', {
        taskId,
        completed: !currentTask.completed,
      });

     

      // Update the state with the updated task
      dispatch({
        type: UPDATE_TASK,
        payload: res.data.data,
      });
    } catch (err) {
      console.error('Error toggling task:', err.response?.data || err.message);
      dispatch({
        type: TASK_ERROR,
        payload: err.response?.data?.error || 'Error updating task',
      });
    }
  };

  // Clear errors
  const clearErrors = () => {
    
    dispatch({ type: CLEAR_ERRORS });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        error: state.error,
        loading: state.loading,
        getTasks,
        toggleTask,
        clearErrors,
      }}
    >
      {props.children}
    </TaskContext.Provider>
  );
};

export default TaskState;