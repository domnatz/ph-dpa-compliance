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
      
      // Fix: Make the completed counting more explicit and reliable
      let completedCount = 0;
      
      // Log each task's completion status to see what's happening
      state.tasks.forEach(task => {
        console.log(`Task ${task._id}: completed=${task.completed}, type=${typeof task.completed}`);
        
        // Only count as completed if it's exactly true (boolean true)
        if (task.completed === true) {
          completedCount++;
        }
      });
      
      // Calculate percentage
      const score = Math.round((completedCount / totalTasks) * 100);
      
      console.log(`FIXED calculation: ${completedCount} completed out of ${totalTasks} total tasks (${score}%)`);
      
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
        console.log(`Toggle task called for ID: ${taskId}`);
        
        // Find current task
        const currentTask = state.tasks.find(task => String(task._id) === String(taskId));
        
        if (!currentTask) {
          console.error(`Task with ID ${taskId} not found in state`);
          return;
        }
        
        // Convert current completed status to boolean and then negate it
        const currentStatus = currentTask.completed === true;
        const newStatus = !currentStatus;
        
        console.log(`Toggling task ${taskId} from ${currentStatus} to ${newStatus}`);
        
        // First update optimistically in the UI
        dispatch({
          type: 'UPDATE_TASK',
          payload: { 
            ...currentTask, 
            completed: newStatus 
          }
        });
        
        // Calculate score after local update
        calculateAndUpdateComplianceScore();
        
        // Then update on the server
        const res = await api.post('/assessments/tasks', {
          taskId,
          completed: newStatus
        });
    
        // Get the response data
        const updatedTask = res.data.data;
        
        console.log('Server response task:', updatedTask);
        
        // Make sure the completed property from server is treated as boolean
        const serverCompleted = updatedTask.completed === true;
        
        // Update state with normalized boolean value
        dispatch({
          type: 'UPDATE_TASK',
          payload: { 
            ...updatedTask, 
            completed: serverCompleted 
          }
        });
        
        // Recalculate score after server update
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