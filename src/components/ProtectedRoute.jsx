import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Matches your path: "/" in index.js
    return <Navigate to="/" />; 
  }

  return children;
};

export default ProtectedRoute;