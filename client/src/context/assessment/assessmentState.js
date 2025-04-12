import React, { useReducer } from 'react';
import AssessmentContext from './assessmentContext';
import assessmentReducer from './assessmentReducer';
import api from '../../utils/api';

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
  const updateTaskStatus = async (taskId, data) => {
    try {
      const res = await api.put(`/api/assessments/tasks/${taskId}`, data);
      
      dispatch({
        type: 'UPDATE_TASK', // Changed from UPDATE_TASK to 'UPDATE_TASK'
        payload: res.data.data
      });
      
      return res.data;
    } catch (error) {
      console.error('Error updating task:', error);
      dispatch({
        type: 'ASSESSMENT_ERROR', // Changed from ASSESSMENT_ERROR to 'ASSESSMENT_ERROR'
        payload: error.response?.data?.error || 'Error updating task'
      });
      throw error;
    }
  };

  // Toggle task completion
  const toggleTask = async taskId => {
    try {
      const res = await api.put(`/assessments/tasks/${taskId}`);

      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
    } catch (err) {
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response.data.error
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