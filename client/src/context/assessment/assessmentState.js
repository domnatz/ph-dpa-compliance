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
            
            // THE FIX: Change the condition - we're counting tasks where completed === FALSE as completed!
            // This inverts our logic and explains the backwards behavior
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
     
            return 0;
          }
        };
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
        payload: err.response?.data?.error || 'Error submitting assessment'
      });
      throw err;
    }
  };

  // Get tasks - UPDATED to calculate compliance score
  const getTasks = async () => {
    try {
      
      const res = await api.get('/assessments/tasks');

      
      dispatch({
        type: 'GET_TASKS',
        payload: res.data.data
      });
      
      // Calculate initial compliance score after tasks are loaded
      setTimeout(() => calculateAndUpdateComplianceScore(), 0);
      
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
     
      const res = await api.post('/assessments', { generateTasks: true });

   
      dispatch({
        type: 'GENERATE_TASKS',
        payload: res.data.data
      });
      
      // Calculate compliance score after generating tasks
      setTimeout(() => calculateAndUpdateComplianceScore(), 0);
      
    } catch (err) {
  
      dispatch({
        type: 'ASSESSMENT_ERROR',
        payload: err.response?.data?.error || 'Error generating tasks'
      });
    }
  };

  // Update task status
  const updateTaskStatus = async (taskId, completed) => {
    try {
      
      
      const res = await api.post('/assessments/tasks', {
        taskId,
        completed
      });
      
     
      dispatch({
        type: 'UPDATE_TASK',
        payload: res.data.data
      });
      
      // Calculate new compliance score after task update
      calculateAndUpdateComplianceScore();
      
    } catch (err) {
      
      
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
         
          return;
        }
        
        // DEBUG: Log the initial state of all tasks
       
        state.tasks.forEach(t => {});
        
        // Get current state (explicitly as boolean)
        const currentCompleted = Boolean(currentTask.completed);
        // Toggle it
        const newStatus = !currentCompleted;
        
        
        
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
        
      
        
        // Update with server response
        dispatch({
          type: 'UPDATE_TASK_FROM_SERVER',
          payload: updatedTask
        });
        
        // DEBUG: Log the final state
        setTimeout(() => {
        
          state.tasks.forEach(t => {});
          // Recalculate score after server update
          calculateAndUpdateComplianceScore();
        }, 0);
        
      } catch (err) {
       
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