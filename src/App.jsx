// src/App.jsx

import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Importamos la configuración de auth
import { onAuthStateChanged, signOut } from 'firebase/auth';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState(null); // Estado para guardar el usuario
  const [loading, setLoading] = useState(true); // Estado para la pantalla de carga inicial

  // Este efecto se ejecuta una vez para comprobar el estado de la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpia el observador cuando el componente se desmonta
    return () => unsubscribe();
  }, []);

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Muestra un mensaje de carga mientras se verifica el usuario
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Cargando aplicación...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user ? (
        // Si hay un usuario, muestra el Dashboard
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        // Si no hay usuario, muestra la página de Login
        <LoginPage />
      )}
    </div>
  );
}

export default App;
