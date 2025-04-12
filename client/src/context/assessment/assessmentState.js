import React, { useReducer } from 'react';
import AssessmentContext from './assessmentContext';
import assessmentReducer from './assessmentReducer';
import api from '../../utils/api'; // Use this instead of direct axios calls
import axios from 'axios'; 

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
      console.log('Fetching assessment...');
      // Changed from axios to api
      const res = await api.get('/api/assessments');
      
      console.log('Assessment response:', res.data);
      dispatch({
        type: 'GET_ASSESSMENT',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error fetching assessment:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error fetching assessment'
      });
    }
  };

  // Submit assessment
  const submitAssessment = async answers => {
    try {
      console.log('Submitting assessment answers:', answers);
      // Changed from axios to api
      const res = await api.post('/api/assessments', { answers });

      console.log('Assessment submission response:', res.data);
      dispatch({
        type: 'SUBMIT_ASSESSMENT',
        payload: res.data.data
      });

      return res.data.data;
    } catch (err) {
      console.error('Error submitting assessment:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error submitting assessment'
      });
      throw err;
    }
  };

  // Get tasks - UPDATED to match server routes
  const getTasks = async () => {
    try {
      console.log('Fetching tasks...');
      // Changed from axios to api
      const res = await api.get('/api/assessments/tasks');

      console.log('Tasks fetched:', res.data.data);
      dispatch({
        type: 'GET_TASKS',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error fetching tasks:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error fetching tasks'
      });
    }
  };

  // Generate tasks
  const generateTasks = async () => {
    try {
      console.log('Generating tasks...');
      // Changed from axios to api
      const res = await api.post('/api/assessments', { generateTasks: true });

      console.log('Tasks generated:', res.data.data);
      dispatch({
        type: 'GENERATE_TASKS',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error generating tasks:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error generating tasks'
      });
    }
  };

  // Update task status - UPDATED to match server routes
  const updateTaskStatus = async (taskId, completed) => {
    try {
      console.log(`Updating task ${taskId} with completed=${completed}`);
      
      // Changed from axios to api
      const res = await api.post('/api/assessments/tasks', {
        taskId,
        completed
      });
      
      console.log('Task update response:', res.data);
      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
    } catch (err) {
      console.error('Error updating task:', err);
      console.error('Response:', err.response?.data);
      console.error('Message:', err.message);
      
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error updating task'
      });
    }
  };

  // Toggle task completion - UPDATED to match server routes
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
      
      // Changed from axios to api
      const res = await api.post('/api/assessments/tasks', {
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
      console.error('Response:', err.response?.data);
      console.error('Status:', err.response?.status);
      console.error('Message:', err.message);
      
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