import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const RolesPermisos = ({ onBack }) => {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver al Panel Principal
      </button>
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <ShieldCheck className="mx-auto h-16 w-16 text-blue-500" />
        <h1 className="text-3xl font-bold mt-4">Roles y Permisos</h1>
        <p className="text-gray-600 mt-2">Este módulo está actualmente en construcción.</p>
        <p className="text-gray-500 mt-4">Aquí podrás crear roles personalizados (como 'Contador' o 'Asistente Académico') y asignarles permisos específicos para cada acción dentro del sistema.</p>
      </div>
    </div>
  );
};

export default RolesPermisos;