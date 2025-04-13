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
        tasks: action.payload,
        loading: false
      };
    case 'GENERATE_TASKS':
      return {
        ...state,
        tasks: action.payload,
        loading: false
      };
      case 'UPDATE_TASK':
        return {
          ...state,
          tasks: state.tasks.map(task =>
            task._id === action.payload._id 
              ? { ...action.payload, completed: Boolean(action.payload.completed) } // Ensure completed is boolean
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