import React, { useState } from 'react';
import { Shield, BookOpen, Users, BarChart2, Bell, Settings, GraduationCap, LogOut } from 'lucide-react';
import GestionUsuarios from './GestionUsuarios';
import GestionCursos from './GestionCursos';
import GestionSemestres from './GestionSemestres';
import RolesPermisos from './RolesPermisos';
import ReportesAnaliticas from './ReportesAnaliticas';
import ConfiguracionGeneral from './ConfiguracionGeneral';

const managementCards = [
  { id: 'gestion-usuarios', title: 'Gestión de Usuarios', description: 'Administrar profesores, alumnos y personal.', icon: <Users />, action: 'Gestionar' },
  { id: 'gestion-cursos', title: 'Gestión de Cursos', description: 'Administrar los cursos ofrecidos.', icon: <GraduationCap />, action: 'Administrar' },
  { id: 'gestion-semestres', title: 'Gestión de Semestres', description: 'Crear y configurar periodos académicos.', icon: <BookOpen />, action: 'Gestionar' },
  { id: 'roles-permisos', title: 'Roles y Permisos', description: 'Definir roles y asignar permisos.', icon: <Shield />, action: 'Configurar' },
  { id: 'reportes-analiticas', title: 'Reportes y Analíticas', description: 'Visualizar el rendimiento y finanzas.', icon: <BarChart2 />, action: 'Ver Reportes' },
  { id: 'configuracion-general', title: 'Configuración General', description: 'Ajustes generales de la plataforma.', icon: <Settings />, action: 'Ajustar' },
];

const AdminDashboard = ({ user, handleLogout }) => {
  const [currentView, setCurrentView] = useState('dashboard');

  const handleCardClick = (cardId) => {
    if (cardId === 'gestion-usuarios') setCurrentView('gestion-usuarios');
    else if (cardId === 'gestion-cursos') setCurrentView('gestion-cursos');
    else if (cardId === 'gestion-semestres') setCurrentView('gestion-semestres');
    else if (cardId === 'roles-permisos') setCurrentView('roles-permisos');
    else if (cardId === 'reportes-analiticas') setCurrentView('reportes-analiticas');
    else if (cardId === 'configuracion-general') setCurrentView('configuracion-general');
    else alert(`La funcionalidad para "${cardId}" aún no está implementada.`);
  };

  // Renderizado de las diferentes vistas
  const renderView = (view) => {
    const commonProps = { onBack: () => setCurrentView('dashboard') };
    const viewMap = {
      'roles-permisos': <RolesPermisos {...commonProps} />,
      'reportes-analiticas': <ReportesAnaliticas {...commonProps} />,
      'configuracion-general': <ConfiguracionGeneral {...commonProps} />,
      'gestion-semestres': <GestionSemestres {...commonProps} />,
      'gestion-cursos': <GestionCursos {...commonProps} />,
      'gestion-usuarios': <GestionUsuarios {...commonProps} />,
    };

    // El div principal ya tiene los colores base en App.jsx, aquí solo pasamos el componente
    return viewMap[view];
  };

  if (currentView !== 'dashboard') {
    return renderView(currentView);
  }

  // Vista principal del dashboard
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administrador</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Bienvenido, {user?.nombre || 'Admin'}.</p>
            </div>
            <div className="flex items-center gap-4">
                <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <Bell className="text-gray-600 dark:text-gray-300" />
                </button>
                <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600">
                  <LogOut size={18} /> Salir
                </button>
            </div>
          </div>
        </header>

        <main>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {managementCards.map((card) => (
              <div key={card.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                      {React.cloneElement(card.icon, { className: 'h-6 w-6 text-blue-600 dark:text-blue-400' })}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{card.title}</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">{card.description}</p>
                </div>
                <button onClick={() => handleCardClick(card.id)} className="w-full mt-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                  {card.action}
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
