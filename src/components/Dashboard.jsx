import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Asegúrate que la ruta a tu config de firebase sea correcta
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Importa los paneles para cada rol
import AdminDashboard from './roles/AdminDashboard';
import ProfesorDashboard from './roles/ProfesorDashboard';
import DefaultDashboard from './roles/DefaultDashboard';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // CORRECCIÓN: Cambiamos 'usuarios' por 'users' para que coincida con tu Firestore.
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData({ uid: user.uid, ...userDocSnap.data() });
          } else {
            console.error("Error: No se encontró el documento para el usuario en Firestore.");
            setUserData(null); // Asegura que no haya datos de un usuario anterior
          }
        } catch (error) {
            console.error("Error al obtener datos de Firestore:", error);
            // Este error es probablemente por las reglas de seguridad.
        }
      } else {
        console.log("No hay usuario autenticado.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).catch((error) => console.error("Error al cerrar sesión:", error));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Cargando...</div>;
  }

  const renderDashboardByRole = () => {
    const props = { user: userData, handleLogout };

    switch (userData?.rol) {
      case 'admin':
        return <AdminDashboard {...props} />;
      case 'profesor':
        return <ProfesorDashboard {...props} />;
      case 'alumno':
        return <DefaultDashboard {...props} />;
      default:
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold">Rol no reconocido o datos no encontrados</h1>
                <p>No tienes un panel asignado o no pudimos cargar tus datos. Contacta al administrador.</p>
                <button onClick={handleLogout} className="mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700">
                    Cerrar Sesión
                </button>
            </div>
        );
    }
  };

  return (
    <div>
      {userData ? renderDashboardByRole() : (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold">No estás logueado o tus datos no se encontraron.</h1>
            <p>Por favor, intenta iniciar sesión de nuevo. Si el problema persiste, contacta al administrador.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
