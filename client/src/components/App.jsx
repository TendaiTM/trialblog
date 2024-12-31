import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute'; // Import the PrivateRoute
import Blogpost from './Blogpost'; 
import LoginPage from './LoginPage'; // Your Login page
import RegistrationPage from './RegistrationPage'; // Your Registration page
import Homepage from './Homepage';
import Postpage from './Postpage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/RegistrationPage" element={<RegistrationPage />} />

        {/* Private Route */}
        <Route path="/Homepage" element={<PrivateRoute><Homepage /></PrivateRoute>} />
        <Route path="/Blogpost" element={<PrivateRoute><Blogpost /></PrivateRoute>} />
        <Route path="/post/:id" element={<PrivateRoute><Postpage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
