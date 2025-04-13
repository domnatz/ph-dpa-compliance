import React, { createContext, useReducer, useState } from 'react';
import assessmentReducer from './assessmentReducer';
import axios from 'axios';
import {
  GET_ASSESSMENT,
  SUBMIT_ASSESSMENT,
  ASSESSMENT_ERROR,
  CLEAR_ERRORS,
  SET_LOADING
} from '../types';

const AssessmentContext = createContext();

export const AssessmentProvider = ({ children }) => {
  const initialState = {
    assessment: null,
    error: null,
    loading: false
  };

  const [state, dispatch] = useReducer(assessmentReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get assessment
  const getAssessment = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/assessments');
      
      dispatch({
        type: GET_ASSESSMENT,
        payload: res.data.data
      });
    } catch (err) {
      // Not finding an assessment is expected for new users, so don't set an error
      if (err.response && err.response.status !== 404) {
        setError(err.response?.data?.error || 'Error fetching assessment');
        
        dispatch({
          type: ASSESSMENT_ERROR,
          payload: err.response?.data?.error || 'Error fetching assessment'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Submit assessment
  const submitAssessment = async (answers) => {
    try {
      setLoading(true);
      
      // Log the answers being submitted

      
      const res = await axios.post('/api/assessments', { answers });
      
      dispatch({
        type: SUBMIT_ASSESSMENT,
        payload: res.data.data
      });
      
      return res.data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error submitting assessment');
      
      dispatch({
        type: ASSESSMENT_ERROR,
        payload: err.response?.data?.error || 'Error submitting assessment'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Generate tasks from assessment
  const generateTasks = async () => {
    try {
      setLoading(true);
      
      // For bypass users, no explicit API call needed as tasks are generated during assessment submission
      // For regular users, this might trigger a task generation endpoint
      
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Error generating tasks');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear errors
  const clearErrors = () => {
    setError(null);
    dispatch({ type: CLEAR_ERRORS });
  };

  return (
    <AssessmentContext.Provider
      value={{
        assessment: state.assessment,
        loading: state.loading || loading,
        error: state.error || error,
        getAssessment,
        submitAssessment,
        generateTasks,
        clearErrors
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export default AssessmentContext;