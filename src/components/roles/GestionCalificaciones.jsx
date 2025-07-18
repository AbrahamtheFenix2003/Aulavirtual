import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, CheckSquare } from 'lucide-react';

const GestionCalificaciones = ({ cursoId, onBack }) => {
  const [curso, setCurso] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [calificaciones, setCalificaciones] = useState({});
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchData = async () => {
    setLoading(true);
    // 1. Cargar datos del curso
    const cursoRef = doc(db, 'cursos', cursoId);
    const cursoSnap = await getDoc(cursoRef);

    if (cursoSnap.exists()) {
      const cursoData = cursoSnap.data();
      setCurso(cursoData);
      setCalificaciones(cursoData.calificaciones || {});

      // 2. Cargar datos de los alumnos inscritos
      const alumnosPromises = cursoData.alumnosInscritos.map(alumnoId => 
        getDoc(doc(db, 'users', alumnoId))
      );
      const alumnosDocs = await Promise.all(alumnosPromises);
      const alumnosList = alumnosDocs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlumnos(alumnosList);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [cursoId]);

  const handleCalificacionChange = (alumnoId, valor) => {
    setCalificaciones(prev => ({ ...prev, [alumnoId]: valor }));
  };

  const handleGuardarCalificaciones = async () => {
    const cursoRef = doc(db, 'cursos', cursoId);
    try {
      await updateDoc(cursoRef, {
        calificaciones: calificaciones
      });
      setSuccessMessage('¡Calificaciones guardadas con éxito!');
      setTimeout(() => setSuccessMessage(''), 3000); // Ocultar mensaje después de 3 segundos
    } catch (error) {
      console.error("Error al guardar calificaciones: ", error);
      alert("No se pudieron guardar las calificaciones.");
    }
  };

  if (loading) return <div>Cargando alumnos...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver a Mis Cursos
      </button>
      <h1 className="text-3xl font-bold mb-4">Gestionar Calificaciones: {curso?.nombre}</h1>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-2 px-4 text-left">Alumno</th>
                <th className="py-2 px-4 text-left">Calificación</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map(alumno => (
                <tr key={alumno.id} className="border-t">
                  <td className="py-3 px-4 font-medium">{alumno.nombre}</td>
                  <td className="py-3 px-4">
                    <input 
                      type="text"
                      className="p-2 border rounded-md w-full md:w-1/2"
                      placeholder="Ej: A, 18, B+"
                      value={calificaciones[alumno.id] || ''}
                      onChange={(e) => handleCalificacionChange(alumno.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end items-center gap-4">
          {successMessage && <p className="text-green-600">{successMessage}</p>}
          <button 
            onClick={handleGuardarCalificaciones}
            className="flex items-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700"
          >
            <CheckSquare size={20} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionCalificaciones;
