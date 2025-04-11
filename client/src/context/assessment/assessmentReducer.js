const assessmentReducer = (state, action) => {
    switch (action.type) {
      case 'GET_ASSESSMENT':
      case 'SUBMIT_ASSESSMENT':
        return {
          ...state,
          assessment: action.payload,
          loading: false
        };
      case 'GET_TASKS':
      case 'GENERATE_TASKS':
        return {
          ...state,
          tasks: action.payload,
          loading: false
        };
                    // Add this case to your reducer
            case 'UPDATE_TASK':
              return {
                ...state,
                tasks: state.tasks.map(task => 
                  task._id === action.payload._id ? action.payload : task
                ),
                loading: false
              };
      case 'ASSESSMENT_ERROR':
        return {
          ...state,
          error: action.payload,
          loading: false
        };
      default:
        return state;
    }
  };
  
  export default assessmentReducer;