import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Assessment from './pages/assessment/Assessment';
import Resources from './pages/resources/Resources';
import Privacy from './pages/privacy/Privacy';  // Import new pages
import Terms from './pages/terms/Terms';        // Import new pages
import Contact from './pages/contact/Contact';  // Import new pages
import PrivateRoute from './components/routing/PrivateRoute';
import AuthState from './context/auth/authState';
import AssessmentState from './context/assessment/assessmentState';
import TaskState from './context/task/taskState';
import AuthContext from './context/auth/authContext';

const AppContent = () => {
  const authContext = useContext(AuthContext);
  const { loadUser } = authContext;

  useEffect(() => {
    // Check localStorage directly for token
    const token = localStorage.getItem('token');
   

    if (token) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col min-h-screen text-gray-900">
      <Navbar />
      <main className="flex-grow text-gray-800">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/assessment" element={
            <PrivateRoute>
              <Assessment />
            </PrivateRoute>
          } />
          <Route path="/resources" element={
            <PrivateRoute>
              <Resources />
            </PrivateRoute>
          } />
          {/* Add new routes - these don't need to be protected */}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <AuthState>
      <AssessmentState>
        <TaskState>
          <Router>
            <AppContent />
          </Router>
        </TaskState>
      </AssessmentState>
    </AuthState>
  );
};

export default App;