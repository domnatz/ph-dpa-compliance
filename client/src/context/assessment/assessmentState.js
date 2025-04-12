import React, { useReducer } from 'react';
import AssessmentContext from './assessmentContext';
import assessmentReducer from './assessmentReducer';
import api from '../../utils/api';
import axios from 'axios'; // Make sure axios is imported

const AssessmentState = props => {
  const initialState = {
    assessment: null,
    tasks: [],
    loading: true,
    error: null
  };

  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  // Get current assessment
  const getAssessment = async () => {
    try {
      const res = await api.get('/assessments');

      dispatch({
        type: 'GET_ASSESSMENT',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error fetching assessment'
      });
    }
  };

  // Submit assessment
  const submitAssessment = async answers => {
    try {
      const res = await api.post('/assessments', { answers });

      dispatch({
        type: 'SUBMIT_ASSESSMENT',
        payload: res.data.data
      });

      return res.data.data;
    } catch (err) {
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response.data.error
      });
      throw err;
    }
  };

  // Get tasks
  const getTasks = async () => {
    try {
      const res = await api.get('/assessments/tasks');

      dispatch({
        type: 'GET_TASKS',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error fetching tasks'
      });
    }
  };

  // Generate tasks
  const generateTasks = async () => {
    try {
      const res = await api.post('/assessments/tasks');

      dispatch({
        type: 'GENERATE_TASKS',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response.data.error
      });
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, completed) => {
    try {
      console.log(`Updating task ${taskId} with completed=${completed}`);
      
      // Use POST method with correct endpoint
      const res = await axios.post('/api/assessments/task', {
        taskId,
        completed
      });
      
      // Process the updated task
      console.log('Task update response:', res.data);
      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error updating task:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error updating task'
      });
    }
  };

  // Toggle task completion - FIXED to use the correct endpoint/method
  const toggleTask = async taskId => {
    try {
      console.log(`Toggle task called for ID: ${taskId}`);
      
      // Find current task to determine its completed status
      const currentTask = state.tasks.find(task => String(task._id) === String(taskId));
      
      if (!currentTask) {
        console.error(`Task with ID ${taskId} not found in state`);
        console.log('Available tasks:', state.tasks);
        return;
      }
      
      // Toggle the completed status
      const newStatus = !currentTask.completed;
      console.log(`Toggling task ${taskId} from ${currentTask.completed} to ${newStatus}`);
      
      // Use POST to match your backend API
      const res = await axios.post('/api/assessments/task', {
        taskId,
        completed: newStatus
      });

      console.log('Toggle response:', res.data);
      
      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error in toggleTask:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error updating task'
      });
    }
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessment: state.assessment,
        tasks: state.tasks,
        loading: state.loading,
        error: state.error,
        getAssessment,
        submitAssessment,
        generateTasks,
        getTasks,
        toggleTask,
        updateTaskStatus
      }}
    >
      {props.children}
    </AssessmentContext.Provider>
  );
};

export default AssessmentState;