// import React, { createContext, useContext, useState, useEffect } from 'react';
// import apiClient from '../lib/apiClient';

// const AuthContext = createContext(undefined);

// // Mock users for demo - in production, this would be handled by a backend
// // const mockUsers = [
// //   {
// //     id: '1',
// //     email: 'admin@cloud.neduet.edu.pk',
// //     name: 'Dr. Ahmad Khan',
// //     role: 'admin',
// //     department: 'CSIT'
// //   },
// //   {
// //     id: '2',
// //     email: 'student@cloud.neduet.edu.pk', 
// //     name: 'Ali Ahmed',
// //     role: 'student',
// //     department: 'CSIT'
// //   }
// // ];

// // Email validation function
// // const isValidNeduetEmail = (email) => {
// //   return email.endsWith('@cloud.neduet.edu.pk');
// // };
// const isValidNeduetEmail = (email) => {
//   return /^[a-zA-Z]+[0-9]+@cloud\.neduet\.edu\.pk$/.test(email); // From user.model.js
// };

// // export function AuthProvider({ children }) {
// //   const [user, setUser] = useState(null);
// //   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     // Check if user is already logged in
// //     const savedUser = localStorage.getItem('csit-quiz-user');
// //     if (savedUser) {
// //       setUser(JSON.parse(savedUser));
// //     }
// //     setLoading(false);
// //   }, []);

// //   // const login = async (email, password) => {
// //   //   // Validate email domain first
// //   //   if (!isValidNeduetEmail(email)) {
// //   //     throw new Error('Only @cloud.neduet.edu.pk email addresses are allowed');
// //   //   }
    
// //   //   // Mock authentication - in production, this would call your backend
// //   //   const foundUser = mockUsers.find(u => u.email === email);
// //   //   if (foundUser) {
// //   //     setUser(foundUser);
// //   //     localStorage.setItem('csit-quiz-user', JSON.stringify(foundUser));
// //   //     return true;
// //   //   }
// //   //   return false;
// //   // };

// //   // const register = async (userData) => {
// //   //   // Validate email domain
// //   //   if (!isValidNeduetEmail(userData.email)) {
// //   //     throw new Error('Only @cloud.neduet.edu.pk email addresses are allowed');
// //   //   }
    
// //   //   // Check if user already exists
// //   //   const existingUser = mockUsers.find(u => u.email === userData.email);
// //   //   if (existingUser) {
// //   //     throw new Error('User already exists with this email');
// //   //   }
    
// //   //   // In production, this would call your backend
// //   //   const newUser = {
// //   //     id: Date.now().toString(),
// //   //     ...userData,
// //   //     role: 'student' // Default role for new registrations
// //   //   };
    
// //   //   mockUsers.push(newUser);
// //   //   setUser(newUser);
// //   //   localStorage.setItem('csit-quiz-user', JSON.stringify(newUser));
// //   //   return true;
// //   // };

// //   const login = async (email, password) => {
// //     // Basic frontend validation (optional, backend also validates)
// //     if (!isValidNeduetEmail(email)) {
// //       throw new Error('Please use your @cloud.neduet.edu.pk email address');
// //     }

// //     try {
// //       // Call the backend login endpoint
// //       const response = await apiClient.post('/auth/login', { email, password }); // Hits POST /api/auth/login

// //       if (response.data && response.data.success) {
// //         setUser(response.data.data); // Backend returns the user object on success
// //         // The backend automatically sets the httpOnly accessToken cookie
// //         return true;
// //       }
// //       // Should not happen if backend uses ApiError, but included for safety
// //       return false;
// //     } catch (error) {
// //       console.error('Login failed:', error.response?.data?.message || error.message);
// //       // Throw the error message from the backend's ApiResponse/ApiError
// //       throw new Error(error.response?.data?.message || 'Login failed. Please check credentials.');
// //     }
// //   };

// //   const register = async (userData) => {
// //     // Frontend validations...
// //     if (!isValidNeduetEmail(userData.email)) {
// //          throw new Error('Only @cloud.neduet.edu.pk email addresses are allowed');
// //     }
// //     // Add other frontend checks if needed (password length, etc.)

// //     // --- Handling File Upload ---
// //     const formData = new FormData();
// //     formData.append('name', userData.name);
// //     formData.append('email', userData.email);
// //     formData.append('password', userData.password);
// //     formData.append('role', userData.role || 'student'); // Use backend default or specific role

// //     // Check if an avatar file was provided in userData (e.g., from a file input)
// //     if (userData.avatarFile instanceof File) {
// //       formData.append('avatar', userData.avatarFile);
// //     }
// //     try {
// //       // Call backend register endpoint with FormData
// //       const response = await apiClient.post('/auth/register', formData, {
// //         headers: {
// //           // IMPORTANT: Let Axios set Content-Type automatically for FormData
// //           'Content-Type': 'multipart/form-data',
// //         },
// //       }); // Hits POST /api/auth/register

// //       if (response.data && response.data.success) {
// //         // Your current backend registers and logs in the user immediately (isVerified: true)
// //         setUser(response.data.data); // Set user state
// //         return true;
// //       }
// //       return false; // Should not happen if backend uses ApiError
// //     } catch (error) {
// //       console.error('Registration failed:', error.response?.data?.message || error.message);
// //       throw new Error(error.response?.data?.message || 'Registration failed.');
// //     }
// //   };

// //   const logout = async () => {
// //     try {
// //       // Call the backend logout endpoint
// //       await apiClient.post('/auth/logout'); // Hits POST /api/auth/logout
// //       // Backend clears the cookie
// //     } catch (error) {
// //       console.error('Logout failed:', error.response?.data?.message || error.message);
// //       // Even if backend fails, clear frontend state
// //     } finally {
// //       setUser(null);
// //     }
// //   };
// //   // const logout = () => {
// //   //   setUser(null);
// //   //   localStorage.removeItem('csit-quiz-user');
// //   // };

// //   return (
// //     <AuthContext.Provider value={{ user, login, register, logout, loading, isValidNeduetEmail }}>
// //       {children}
// //     </AuthContext.Provider>
// //   );
// // }

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Check login status on app load
//   useEffect(() => {
//     const checkAuthStatus = async () => {
//       setLoading(true);
//       try {
//         // Use the backend endpoint to get the current user based on the cookie
//         const response = await apiClient.get('/auth/current-user'); // Hits GET /api/auth/current-user
//         if (response.data && response.data.success) {
//           setUser(response.data.data.user); // Backend sends sanitized user data
//         } else {
//           setUser(null);
//         }
//       } catch (error) {
//         // A 401 error here typically means no valid cookie/session
//         setUser(null);
//         console.info('No active session found.'); // Informative log, not necessarily an error
//       } finally {
//         setLoading(false);
//       }
//     };
//     checkAuthStatus();
//   }, []);

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// }

// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../lib/apiClient.js';

const AuthContext = createContext(undefined);

const isValidNeduetEmail = (email) => {
  return /^[a-zA-Z]+[0-9]+@cloud\.neduet\.edu\.pk$/.test(email);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get('/auth/current-user');
        if (response.data && response.data.success) {
          setUser(response.data.data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        console.info('No active session found.');
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    if (!isValidNeduetEmail(email)) {
      throw new Error('Please use your @cloud.neduet.edu.pk email address');
    }

    try {

      const response = await apiClient.post('/auth/login', { email, password }); // Hits POST /api/auth/login

      if (response.data && response.data.success) {
        setUser(response.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const register = async (userData) => {
    if (!isValidNeduetEmail(userData.email)) {
         throw new Error('Only @cloud.neduet.edu.pk email addresses are allowed');
    }

    const formData = new FormData();
    formData.append('name', userData.name);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('role', userData.role || 'student');

    if (userData.avatarFile instanceof File) {
      formData.append('avatar', userData.avatarFile);
    }

    try {
      const response = await apiClient.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
         setUser(response.data.data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      throw new Error(error.response?.data?.message || 'Registration failed.');
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error.response?.data?.message || error.message);
    } finally {
      setUser(null);
    }
  };

  return (
    // Provider value includes the functions using apiClient
    <AuthContext.Provider value={{ user, login, register, logout, loading, isValidNeduetEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

// useAuth hook remains the same
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}