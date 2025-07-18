import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Edit, ClipboardCheck, Upload, LogOut } from 'lucide-react';
import GestionCalificaciones from './GestionCalificaciones';
import GestionMaterial from './GestionMaterial';
import GestionAsistencia from './GestionAsistencia';

const ProfesorDashboard = ({ user, handleLogout }) => {
  const [misCursos, setMisCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [vista, setVista] = useState('lista');
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [activeSemestre, setActiveSemestre] = useState(null);

  useEffect(() => {
    if (!user?.uid || vista !== 'lista') return;

    const fetchData = async () => {
      setLoading(true);
      // 1. Buscar el semestre activo
      const semestresQuery = query(collection(db, 'semestres'), where('estado', '==', 'activo'));
      const semestresSnapshot = await getDocs(semestresQuery);
      
      if (semestresSnapshot.empty) {
        setActiveSemestre(null);
        setMisCursos([]);
        setLoading(false);
        return;
      }
      
      const activeSemestreData = { id: semestresSnapshot.docs[0].id, ...semestresSnapshot.docs[0].data() };
      setActiveSemestre(activeSemestreData);

      // 2. Buscar cursos del profesor EN el semestre activo
      const cursosQuery = query(
        collection(db, 'cursos'), 
        where('profesorId', '==', user.uid),
        where('semestreId', '==', activeSemestreData.id)
      );
      const querySnapshot = await getDocs(cursosQuery);
      const cursosList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMisCursos(cursosList);
      setLoading(false);
    };

    fetchData();
  }, [user, vista]);

  const handleNavigate = (nuevaVista, cursoId) => {
    setCursoSeleccionado(cursoId);
    setVista(nuevaVista);
  };

  if (vista === 'calificaciones') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
        <GestionCalificaciones cursoId={cursoSeleccionado} onBack={() => setVista('lista')} />
      </div>
    );
  }

  if (vista === 'material') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
        <GestionMaterial cursoId={cursoSeleccionado} onBack={() => setVista('lista')} />
      </div>
    );
  }
  
  if (vista === 'asistencia') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
        <GestionAsistencia cursoId={cursoSeleccionado} onBack={() => setVista('lista')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel del Profesor</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {user?.nombre || 'Profesor'}.</p>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600">
              <LogOut size={18} />
              <span>Salir</span>
          </button>
        </header>

        <main>
          {activeSemestre && <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mis Cursos Asignados ({activeSemestre.nombre})</h2>}
          
          {loading ? <p>Cargando...</p> : !activeSemestre ? (
             <p className="text-center text-gray-600 p-8 bg-gray-100 rounded-lg">No hay un semestre activo configurado por el administrador.</p>
          ) : (
            <div className="space-y-6">
              {misCursos.length > 0 ? misCursos.map(curso => (
                <div key={curso.id} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-4 mb-4">
                      <div>
                          <h3 className="text-xl font-bold text-gray-900">{curso.nombre}</h3>
                          <p className="text-gray-600 mt-1">{curso.alumnosInscritos.length} alumno(s) inscrito(s)</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button onClick={() => handleNavigate('material', curso.id)} className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-3 px-4 rounded-lg"><Upload size={20} /><span>Subir Material</span></button>
                      <button onClick={() => handleNavigate('calificaciones', curso.id)} className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-lg"><Edit size={20} /><span>Gestionar Calificaciones</span></button>
                      <button onClick={() => handleNavigate('asistencia', curso.id)} className="flex items-center justify-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold py-3 px-4 rounded-lg"><ClipboardCheck size={20} /><span>Registrar Asistencia</span></button>
                  </div>
                </div>
              )) : <p>No tienes cursos asignados para el semestre activo.</p>}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ProfesorDashboard;
