// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { db } from '../firebase'; // Importamos la base de datos
import { doc, getDoc } from 'firebase/firestore';

// Importamos los paneles de control específicos para cada rol
import AdminDashboard from './roles/AdminDashboard';
import ProfesorDashboard from './roles/ProfesorDashboard';
import DefaultDashboard from './roles/DefaultDashboard';

function Dashboard({ user, onLogout }) {
  const [userRole, setUserRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  // Este efecto se ejecuta cuando el usuario inicia sesión para obtener su rol
  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        // Creamos una referencia al documento del usuario en la colección 'users'
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Si el documento existe, obtenemos el rol
          setUserRole(userDocSnap.data().role);
        } else {
          // Si el documento no existe en Firestore, le asignamos un rol por defecto o nulo
          console.log("No se encontró un rol para este usuario.");
          setUserRole('default'); 
        }
        setLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [user]); // Se ejecuta cada vez que el objeto 'user' cambia

  // Muestra un componente diferente basado en el rol del usuario
  const renderDashboardByRole = () => {
    switch (userRole) {
      case 'administrador':
        return <AdminDashboard />;
      case 'profesor':
        return <ProfesorDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">Academia Virtual</h1>
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{user.email}</span>
            {userRole && <span className="px-2 py-1 ml-2 text-xs font-bold text-white bg-blue-500 rounded-full">{userRole.toUpperCase()}</span>}
          </p>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>
      <main className="p-8">
        {loadingRole ? (
          <p>Verificando permisos...</p>
        ) : (
          renderDashboardByRole()
        )}
      </main>
    </div>
  );
}

export default Dashboard;
