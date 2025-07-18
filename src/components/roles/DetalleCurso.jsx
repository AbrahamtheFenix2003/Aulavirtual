import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, collection, getDocs } from 'firebase/firestore';
import { ArrowLeft, UserPlus, GraduationCap } from 'lucide-react';

const DetalleCurso = ({ cursoId, onBack }) => {
  const [curso, setCurso] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para los formularios de asignación
  const [profesorSeleccionado, setProfesorSeleccionado] = useState('');
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState('');

  // Cargar datos del curso y de los usuarios
  const fetchData = async () => {
    setLoading(true);
    // Cargar datos del curso específico
    const cursoRef = doc(db, 'cursos', cursoId);
    const cursoSnap = await getDoc(cursoRef);
    if (cursoSnap.exists()) {
      setCurso({ id: cursoSnap.id, ...cursoSnap.data() });
    }

    // Cargar todos los usuarios para los dropdowns
    const usersSnap = await getDocs(collection(db, 'users'));
    const usersList = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsuarios(usersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [cursoId]);

  const handleAsignarProfesor = async (e) => {
    e.preventDefault();
    if (!profesorSeleccionado) return;
    const cursoRef = doc(db, 'cursos', cursoId);
    await updateDoc(cursoRef, {
      profesorId: profesorSeleccionado
    });
    fetchData(); // Recargar datos para ver el cambio
  };

  const handleInscribirAlumno = async (e) => {
    e.preventDefault();
    if (!alumnoSeleccionado) return;
    const cursoRef = doc(db, 'cursos', cursoId);
    await updateDoc(cursoRef, {
      alumnosInscritos: arrayUnion(alumnoSeleccionado)
    });
    fetchData(); // Recargar datos para ver el cambio
  };

  if (loading) return <div>Cargando detalles del curso...</div>;
  if (!curso) return <div>Curso no encontrado.</div>;

  // Filtramos usuarios para los selectores
  const profesores = usuarios.filter(u => u.rol === 'profesor');
  const alumnos = usuarios.filter(u => u.rol === 'alumno');
  const profesorActual = usuarios.find(u => u.id === curso.profesorId);

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver a la Lista de Cursos
      </button>

      <h1 className="text-3xl font-bold mb-2">{curso.nombre}</h1>
      <p className="text-gray-600 mb-8">{curso.descripcion}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sección de Asignación */}
        <div className="space-y-8">
          {/* Asignar Profesor */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Profesor Asignado</h2>
            {profesorActual ? (
              <p className="text-lg">{profesorActual.nombre}</p>
            ) : (
              <p className="text-gray-500">Aún no hay un profesor asignado.</p>
            )}
            <form onSubmit={handleAsignarProfesor} className="mt-4 space-y-3">
              <select onChange={e => setProfesorSeleccionado(e.target.value)} className="w-full p-2 border rounded-md">
                <option value="">Seleccionar profesor...</option>
                {profesores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Asignar Profesor</button>
            </form>
          </div>

          {/* Inscribir Alumno */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Inscribir Alumno</h2>
            <form onSubmit={handleInscribirAlumno} className="space-y-3">
              <select onChange={e => setAlumnoSeleccionado(e.target.value)} className="w-full p-2 border rounded-md">
                <option value="">Seleccionar alumno...</option>
                {alumnos.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Inscribir Alumno</button>
            </form>
          </div>
        </div>

        {/* Lista de Alumnos Inscritos */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <GraduationCap /> Alumnos Inscritos ({curso.alumnosInscritos.length})
          </h2>
          <ul className="space-y-2">
            {curso.alumnosInscritos.map(alumnoId => {
              const alumnoInfo = usuarios.find(u => u.id === alumnoId);
              return <li key={alumnoId} className="p-2 bg-gray-100 rounded-md">{alumnoInfo ? alumnoInfo.nombre : 'Usuario no encontrado'}</li>;
            })}
            {curso.alumnosInscritos.length === 0 && <p className="text-gray-500">No hay alumnos inscritos en este curso.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DetalleCurso;
