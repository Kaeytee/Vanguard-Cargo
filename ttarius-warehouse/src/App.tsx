
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './app/login';

/**
 * App Component
 * 
 * This is the main application component that handles routing.
 * It sets up the routes for the application, including the login page.
 * The default route redirects to the login page.
 */
const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login />} />
        
        {/* Default route - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
