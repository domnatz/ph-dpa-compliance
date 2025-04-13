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
        
        // Log each task's completion status
        console.log('=== Task Completion Status ===');
        state.tasks.forEach(task => {
          console.log(`Task ${task._id.substring(0, 10)}...: completed=${Boolean(task.completed)}`);
        });
        
        // Count completed tasks (using Boolean to force proper type)
        const completedTasks = state.tasks.filter(task => Boolean(task.completed)).length;
        
        console.log(`Completed: ${completedTasks}/${totalTasks} tasks`);
        
        // Calculate percentage
        const score = Math.round((completedTasks / totalTasks) * 100);
        
        console.log(`Compliance score: ${score}%`);
        
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

        // Updated toggle task function with debug logging and fixed state handling
    const toggleTask = async taskId => {
      try {
        // Find current task
        const currentTask = state.tasks.find(task => String(task._id) === String(taskId));
        
        if (!currentTask) {
          console.error(`Task with ID ${taskId} not found in state`);
          return;
        }
        
        // DEBUG: Log the initial state of all tasks
        console.log('BEFORE toggle - All tasks:');
        state.tasks.forEach(t => console.log(`Task ${t._id}: completed=${t.completed}`));
        
        // Get current state (explicitly as boolean)
        const currentCompleted = Boolean(currentTask.completed);
        // Toggle it
        const newStatus = !currentCompleted;
        
        console.log(`Toggle ${taskId}: ${currentCompleted} → ${newStatus}`);
        
        // First update locally for immediate feedback
        dispatch({
          type: 'UPDATE_TASK',
          payload: { 
            ...currentTask, 
            completed: newStatus
          }
        });
        
        // Calculate score after local update
        calculateAndUpdateComplianceScore();
        
        // Then send to server
        const res = await api.post('/assessments/tasks', {
          taskId,
          completed: newStatus
        });
    
        // Extra validation to ensure boolean conversion
        const updatedTask = {
          ...res.data.data,
          completed: res.data.data.completed === true
        };
        
        console.log(`Server returned: ${updatedTask._id} with completed=${updatedTask.completed}`);
        
        // Update with server response
        dispatch({
          type: 'UPDATE_TASK_FROM_SERVER',
          payload: updatedTask
        });
        
        // DEBUG: Log the final state
        setTimeout(() => {
          console.log('AFTER server update - Current tasks:');
          state.tasks.forEach(t => console.log(`Task ${t._id}: completed=${t.completed}`));
          // Recalculate score after server update
          calculateAndUpdateComplianceScore();
        }, 0);
        
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