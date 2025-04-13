import React, { useReducer } from 'react';
import AssessmentContext from './assessmentContext';
import assessmentReducer from './assessmentReducer';
import api from '../../utils/api';

const AssessmentState = props => {
  const initialState = {
    assessment: null,
    tasks: [],
    loading: true,
    error: null,
    complianceScore: 0 // Added to track task completion percentage
  };

  const [state, dispatch] = useReducer(assessmentReducer, initialState);

  // Calculate and update compliance score based on completed tasks
    const calculateAndUpdateComplianceScore = () => {
    try {
      const totalTasks = state.tasks.length;
      if (totalTasks === 0) {
        dispatch({
          type: 'UPDATE_COMPLIANCE_SCORE',
          payload: 0
        });
        return 0;
      }
      
      // IMPORTANT: Count ONLY tasks where completed is EXACTLY true
      const completedTasks = state.tasks.filter(task => task.completed === true).length;
      
      // Calculate percentage
      const score = Math.round((completedTasks / totalTasks) * 100);
      
      // Update state with new score
      dispatch({
        type: 'UPDATE_COMPLIANCE_SCORE',
        payload: score
      });
      
      return score;
    } catch (error) {
      console.error('Error calculating compliance score:', error);
      return 0;
    }
  };

  // Get current assessment
  const getAssessment = async () => {
    try {
      console.log('Fetching assessment...');
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

  // Submit assessment
  const submitAssessment = async answers => {
    try {
      console.log('Submitting assessment answers:', answers);
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

  // Get tasks - UPDATED to calculate compliance score
  const getTasks = async () => {
    try {
      console.log('Fetching tasks...');
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

  // Generate tasks
  const generateTasks = async () => {
    try {
      console.log('Generating tasks...');
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

  // Update task status
  const updateTaskStatus = async (taskId, completed) => {
    try {
      console.log(`Updating task ${taskId} with completed=${completed}`);
      
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

    // Toggle task completion - Enhanced to ensure proper task state
        const toggleTask = async taskId => {
      try {
        // Find current task
        const currentTask = state.tasks.find(task => String(task._id) === String(taskId));
        
        if (!currentTask) {
          console.error(`Task with ID ${taskId} not found in state`);
          return;
        }
        
        // IMPORTANT: Get the ACTUAL current state from the current task
        const currentCompleted = currentTask.completed === true;
        // Toggle it
        const newStatus = !currentCompleted;
        
        // SKIP local optimistic update - it's causing inconsistencies
        // Instead, just send the request first
        const res = await api.post('/assessments/tasks', {
          taskId,
          completed: newStatus
        });
    
        // Get the ACTUAL completed status from the server response
        const updatedTask = res.data.data;
        const serverCompleted = updatedTask.completed === true;
        
        // Update state with the CORRECT server value
        dispatch({
          type: 'UPDATE_TASK',
          payload: { 
            ...updatedTask, 
            completed: serverCompleted  // Ensure this is a boolean
          }
        });
        
        // AFTER server update, recalculate score with the CORRECT data
        calculateAndUpdateComplianceScore();
        
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
        complianceScore: state.complianceScore, // Expose the compliance score
        getAssessment,
        submitAssessment,
        generateTasks,
        getTasks,
        toggleTask,
        updateTaskStatus,
        calculateAndUpdateComplianceScore // Expose this function for manual recalculation if needed
      }}
    >
      {props.children}
    </AssessmentContext.Provider>
  );
};

export default AssessmentState;