import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReporterDashboard from './pages/ReporterDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Donations from './pages/Donations';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ 
  children, 
  allowedRoles 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Main App Routes
const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/donations" element={<Donations />} />
      
      <Route 
        path="/reporter-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Reporter', 'Admin']}>
            <Layout>
              <ReporterDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/volunteer-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Volunteer', 'Admin']}>
            <Layout>
              <VolunteerDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* Redirect based on user role */}
      <Route 
        path="/dashboard" 
        element={
          user ? (
            user.role === 'Admin' ? <Navigate to="/admin-dashboard" replace /> :
            user.role === 'Reporter' ? <Navigate to="/reporter-dashboard" replace /> :
            user.role === 'Volunteer' ? <Navigate to="/volunteer-dashboard" replace /> :
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
