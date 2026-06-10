// Reducer.js
import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_FAILURE,
  LOGOUT
} from './Types';

const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = localStorage.getItem('user');

// Safe parsing function
const parseUser = (userString) => {
  if (!userString || userString === 'undefined' || userString === 'null') {
    return null;
  }
  try {
    return JSON.parse(userString);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

const initialState = {
  isAuthenticated: !!tokenFromStorage && tokenFromStorage !== 'undefined',
  token: tokenFromStorage && tokenFromStorage !== 'undefined' ? tokenFromStorage : null,
  user: parseUser(userFromStorage),
  loading: false,
  error: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case AUTH_REQUEST:
      return { ...state, loading: true, error: null };

    case AUTH_SUCCESS:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null
      };

    case AUTH_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
        loading: false,
        error: null
      };

    default:
      return state;
  }
};

export default authReducer;