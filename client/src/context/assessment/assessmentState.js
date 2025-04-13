import React, { useReducer } from 'react';
import AssessmentContext from './assessmentContext';
import assessmentReducer from './assessmentReducer';
import api from '../../utils/api';
import axios from 'axios';

const AssessmentState = props => {
  const initialState = {
    assessment: null,
    tasks: [],
    loading: true,
    error: null,
    complianceScore: 0 // Added compliance score to track progress
  };

  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  // Calculate and update compliance score
  const calculateAndUpdateComplianceScore = () => {
    try {
      // First get the updated tasks list
      const totalTasks = state.tasks.length;
      if (totalTasks === 0) return;
      
      // Count completed tasks
      const completedTasks = state.tasks.filter(task => task.completed).length;
      
      // Calculate the percentage (rounded to nearest whole number)
      const score = Math.round((completedTasks / totalTasks) * 100);
      
      console.log(`Compliance score updated: ${completedTasks}/${totalTasks} tasks complete (${score}%)`);
      
      // Update the score in state
      dispatch({
        type: 'UPDATE_COMPLIANCE_SCORE',
        payload: score
      });
      
      // Optionally save this to the backend
      api.post('/assessments/compliance-score', { score })
        .then(res => console.log('Compliance score saved to server'))
        .catch(err => console.error('Failed to save compliance score:', err));
        
    } catch (error) {
      console.error('Error calculating compliance score:', error);
    }
  };

  // Get current assessment - FIXED PATH
  const getAssessment = async () => {
    try {
      console.log('Fetching assessment...');
      // REMOVED DUPLICATE /api/ PREFIX
      const res = await api.get('/assessments');
      
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

  // Submit assessment - FIXED PATH
  const submitAssessment = async answers => {
    try {
      console.log('Submitting assessment answers:', answers);
      // REMOVED DUPLICATE /api/ PREFIX
      const res = await api.post('/assessments', { answers });

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

  // Get tasks - FIXED PATH and added compliance score update
  const getTasks = async () => {
    try {
      console.log('Fetching tasks...');
      // REMOVED DUPLICATE /api/ PREFIX
      const res = await api.get('/assessments/tasks');

      console.log('Tasks fetched:', res.data.data);
      dispatch({
        type: 'GET_TASKS',
        payload: res.data.data
      });
      
      // Calculate initial compliance score after tasks are loaded
      setTimeout(() => calculateAndUpdateComplianceScore(), 0);
      
    } catch (err) {
      console.error('Error fetching tasks:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error fetching tasks'
      });
    }
  };

  // Generate tasks - FIXED PATH
  const generateTasks = async () => {
    try {
      console.log('Generating tasks...');
      // REMOVED DUPLICATE /api/ PREFIX
      const res = await api.post('/assessments', { generateTasks: true });

      console.log('Tasks generated:', res.data.data);
      dispatch({
        type: 'GENERATE_TASKS',
        payload: res.data.data
      });
      
      // Calculate compliance score after generating tasks
      setTimeout(() => calculateAndUpdateComplianceScore(), 0);
      
    } catch (err) {
      console.error('Error generating tasks:', err);
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error generating tasks'
      });
    }
  };

  // Update task status - FIXED PATH
  const updateTaskStatus = async (taskId, completed) => {
    try {
      console.log(`Updating task ${taskId} with completed=${completed}`);
      
      // REMOVED DUPLICATE /api/ PREFIX
      const res = await api.post('/assessments/tasks', {
        taskId,
        completed
      });
      
      console.log('Task update response:', res.data);
      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
      
      // Calculate new compliance score after task update
      calculateAndUpdateComplianceScore();
      
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

  // Toggle task completion - FIXED PATH and updated to recalculate compliance score
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
      
      // REMOVED DUPLICATE /api/ PREFIX
      const res = await api.post('/assessments/tasks', {
        taskId,
        completed: newStatus
      });

      console.log('Toggle response:', res.data);
      
      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
      
      // Calculate new compliance score after task toggle
      calculateAndUpdateComplianceScore();
      
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
        complianceScore: state.complianceScore, // Added compliance score to context
        getAssessment,
        submitAssessment,
        generateTasks,
        getTasks,
        toggleTask,
        updateTaskStatus,
        calculateAndUpdateComplianceScore // Added function to recalculate compliance
      }}
    >
      {props.children}
    </AssessmentContext.Provider>
  );
};

export default AssessmentState;