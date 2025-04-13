export default (state, action) => {
  switch (action.type) {
    case 'GET_ASSESSMENT':
      return {
        ...state,
        assessment: action.payload,
        loading: false
      };
    case 'SUBMIT_ASSESSMENT':
      return {
        ...state,
        assessment: action.payload,
        loading: false
      };
    case 'GET_TASKS':
    return {
      ...state,
      // Normalize all task completed values to be boolean
      tasks: action.payload ? action.payload.map(task => ({
        ...task,
        completed: task.completed === true
      })) : [],
      loading: false
    };
        case 'GENERATE_TASKS':
      return {
        ...state,
        // Normalize task completed values for generated tasks too
        tasks: action.payload ? action.payload.map(task => ({
          ...task,
          completed: task.completed === true
        })) : [],
        loading: false
      };
            case 'UPDATE_TASK':
        return {
          ...state,
          tasks: state.tasks.map(task => 
            task._id === action.payload._id 
              ? { 
                  ...action.payload, 
                  // IMPORTANT: Always convert to a proper boolean
                  completed: action.payload.completed === true
                }
              : task
          ),
          loading: false
        };
    case 'UPDATE_COMPLIANCE_SCORE':
      return {
        ...state,
        complianceScore: action.payload
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