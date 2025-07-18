import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth'; // Hook para facilitar el manejo de auth
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

// Componente para proteger rutas
function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Verificando sesión...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/" />;
}

function App() {
  const [user, loading] = useAuthState(auth);

  return (
    <ThemeProvider>
      <Router>
        <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 min-h-screen">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
            />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
