import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';

// Función para obtener la fecha de hoy en formato YYYY-MM-DD
const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const GestionAsistencia = ({ cursoId, onBack }) => {
  const [alumnos, setAlumnos] = useState([]);
  const [cursoNombre, setCursoNombre] = useState('');
  const [fecha, setFecha] = useState(getTodayString());
  const [asistencias, setAsistencias] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const cursoRef = doc(db, 'cursos', cursoId);
      const cursoSnap = await getDoc(cursoRef);

      if (cursoSnap.exists()) {
        const cursoData = cursoSnap.data();
        setCursoNombre(cursoData.nombre);

        // Cargar datos de los alumnos inscritos
        const alumnosPromises = cursoData.alumnosInscritos.map(alumnoId =>
          getDoc(doc(db, 'users', alumnoId))
        );
        const alumnosDocs = await Promise.all(alumnosPromises);
        const alumnosList = alumnosDocs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAlumnos(alumnosList);
      }
      setLoading(false);
    };
    fetchData();
  }, [cursoId]);

  useEffect(() => {
    // Cargar la asistencia guardada para la fecha seleccionada
    const fetchAsistencia = async () => {
      const asistenciaRef = doc(db, 'cursos', cursoId, 'asistencias', fecha);
      const asistenciaSnap = await getDoc(asistenciaRef);
      if (asistenciaSnap.exists()) {
        setAsistencias(asistenciaSnap.data());
      } else {
        setAsistencias({}); // Si no hay datos para esa fecha, limpiar el estado
      }
    };
    if (fecha) {
      fetchAsistencia();
    }
  }, [fecha, cursoId]);

  const handleStatusChange = (alumnoId, status) => {
    setAsistencias(prev => ({ ...prev, [alumnoId]: status }));
  };

  const handleGuardarAsistencia = async () => {
    setSaving(true);
    const asistenciaRef = doc(db, 'cursos', cursoId, 'asistencias', fecha);
    try {
      await setDoc(asistenciaRef, asistencias);
      alert('¡Asistencia guardada con éxito!');
    } catch (error) {
      console.error("Error al guardar asistencia: ", error);
      alert('No se pudo guardar la asistencia.');
    }
    setSaving(false);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver a Mis Cursos
      </button>
      <h1 className="text-3xl font-bold mb-4">Registrar Asistencia: {cursoNombre}</h1>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="mb-6">
          <label htmlFor="fecha-asistencia" className="block text-sm font-medium text-gray-700 mb-1">Seleccionar Fecha:</label>
          <input type="date" id="fecha-asistencia" value={fecha} onChange={e => setFecha(e.target.value)} className="p-2 border rounded-md"/>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Alumno</th>
                <th className="py-2 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map(alumno => (
                <tr key={alumno.id} className="border-t">
                  <td className="py-3 px-4 font-medium">{alumno.nombre}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleStatusChange(alumno.id, 'presente')} className={`p-2 rounded-full ${asistencias[alumno.id] === 'presente' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}><Check /></button>
                      <button onClick={() => handleStatusChange(alumno.id, 'tarde')} className={`p-2 rounded-full ${asistencias[alumno.id] === 'tarde' ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}><Clock /></button>
                      <button onClick={() => handleStatusChange(alumno.id, 'ausente')} className={`p-2 rounded-full ${asistencias[alumno.id] === 'ausente' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}><X /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={handleGuardarAsistencia} disabled={saving} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            {saving ? 'Guardando...' : 'Guardar Asistencia'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GestionAsistencia;
