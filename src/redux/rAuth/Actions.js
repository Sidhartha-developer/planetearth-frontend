import axiosInstance from '../../api/axiosInstance';
import {
  AUTH_REQUEST,
  AUTH_SUCCESS,
  AUTH_FAILURE,
  LOGOUT
} from './Types';

// Login Action
export const login = (email, password) => {
  return async (dispatch) => {
    try {
      dispatch({ type: AUTH_REQUEST });
      
      const { data } = await axiosInstance.post('/api/auth/login', { email, password });

      // Extract the actual data from the nested structure
      const { token, ...userData } = data.data; // token and user data are in data.data
      
      // Save token and user to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          token: token,
          user: userData
        }
      });

      return data.data; // Return the actual data object
    } catch (err) {
      console.error('❌ Login failed:', err);
      console.error('❌ Error response:', err.response?.data);
      
      const errorMessage = err.response?.data?.message || 'Login failed';
      dispatch({
        type: AUTH_FAILURE,
        payload: errorMessage
      });
      console.log('❌ AUTH_FAILURE dispatched with error:', errorMessage);
      
      throw errorMessage; // Re-throw for component error handling
    }
  };
};

// Retrieve user from localStorage
export const retrieveUserFromLocalStorage = () => {
  return (dispatch) => {
    dispatch({ type: AUTH_REQUEST });

    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    
    // console.log('📦 Retrieved from localStorage:', { 
    //   token: token ? `${token.substring(0, 20)}...` : 'null', 
    //   userString 
    // });

    // Check for invalid values
    if (!token || token === 'undefined' || !userString || userString === 'undefined') {
      console.warn('⚠️ Invalid token or user data in localStorage. Logging out...');
      dispatch({ type: LOGOUT });
      return;
    }

    try {
      const user = JSON.parse(userString);
      
      dispatch({
        type: AUTH_SUCCESS,
        payload: {
          token,
          user
        }
      });
    } catch (error) {
      console.error('❌ Error parsing user data from localStorage:', error);
      console.error('❌ Invalid user string:', userString);
      dispatch({ type: LOGOUT });
    }
  };
};

// Logout Action
export const logout = () => {
  return (dispatch) => {
    console.log('🚪 Logout initiated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🗑️ Token and user removed from localStorage');
    
    dispatch({ type: LOGOUT });
  };
};