import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { BookOpen, CheckCircle, DollarSign, Bell, LogOut, Award, X, File, Download, ClipboardList } from 'lucide-react';

const DefaultDashboard = ({ user, handleLogout }) => {
  const [misCursos, setMisCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSemestre, setActiveSemestre] = useState(null);
  
  const [isGradesModalOpen, setIsGradesModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // --- INICIO DE LA MODIFICACIÓN: Lógica para el estado financiero ---
  const estadoFinanciero = user?.estadoFinanciero || 'No definido';
  const estaAlDia = estadoFinanciero === 'Al día';
  // --- FIN DE LA MODIFICACIÓN ---

  useEffect(() => {
    if (!user?.uid) return;

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

      // 2. Buscar cursos del alumno EN el semestre activo
      const cursosQuery = query(
        collection(db, 'cursos'), 
        where('alumnosInscritos', 'array-contains', user.uid),
        where('semestreId', '==', activeSemestreData.id)
      );
      const querySnapshot = await getDocs(cursosQuery);

      const cursosPromises = querySnapshot.docs.map(async (cursoDoc) => {
        const cursoData = cursoDoc.data();
        let profesorNombre = 'Profesor no asignado';
        const miCalificacion = cursoData.calificaciones?.[user.uid] || 'Sin calificar';

        if (cursoData.profesorId) {
          const profesorRef = doc(db, 'users', cursoData.profesorId);
          const profesorSnap = await getDoc(profesorRef);
          if (profesorSnap.exists()) {
            profesorNombre = profesorSnap.data().nombre;
          }
        }
        
        return { id: cursoDoc.id, ...cursoData, profesorNombre, calificacion: miCalificacion };
      });

      const cursosCompletos = await Promise.all(cursosPromises);
      setMisCursos(cursosCompletos);
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const openModal = async (curso, type) => {
    setSelectedCurso(curso);
    if (type === 'grades') setIsGradesModalOpen(true);
    if (type === 'material') setIsMaterialModalOpen(true);
    if (type === 'attendance') {
      setIsAttendanceModalOpen(true);
      setLoadingModal(true);
      const asistenciaRef = collection(db, 'cursos', curso.id, 'asistencias');
      const asistenciaSnap = await getDocs(asistenciaRef);
      const records = [];
      asistenciaSnap.forEach(doc => {
        const status = doc.data()[user.uid];
        if (status) {
          records.push({ fecha: doc.id, estado: status });
        }
      });
      setAttendanceRecords(records);
      setLoadingModal(false);
    }
  };

  const closeModal = () => {
    setIsGradesModalOpen(false);
    setIsMaterialModalOpen(false);
    setIsAttendanceModalOpen(false);
    setSelectedCurso(null);
    setAttendanceRecords([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portal del Alumno</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {user?.nombre || 'Alumno'}.</p>
          </div>
           <button onClick={handleLogout} className="flex items-center gap-2 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600"><LogOut size={18} /><span>Salir</span></button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeSemestre && <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mis Cursos ({activeSemestre.nombre})</h2>}
            
            {loading ? <p>Cargando...</p> : !activeSemestre ? (
              <div className="text-center text-gray-600 p-8 bg-gray-100 rounded-lg">
                <p className="font-semibold">No hay un semestre activo.</p>
                <p className="text-sm">Por favor, contacta a un administrador.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {misCursos.length > 0 ? misCursos.map(curso => (
                  <div key={curso.id} className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center gap-4">
                      <span className={`h-3 w-3 rounded-full bg-blue-500`}></span>
                      <h3 className="text-xl font-bold text-gray-900 flex-grow">{curso.nombre}</h3>
                      <div className="flex items-center gap-2 font-bold text-lg text-gray-700 bg-gray-100 px-3 py-1 rounded-full"><Award size={18} className="text-yellow-500"/><span>{curso.calificacion}</span></div>
                    </div>
                    <p className="text-gray-600 mt-1 mb-4 ml-7">Profesor: {curso.profesorNombre}</p>
                    <div className="flex flex-wrap gap-4 ml-7">
                       <button onClick={() => openModal(curso, 'material')} className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg"><BookOpen size={18} /> Ver Material</button>
                       <button onClick={() => openModal(curso, 'grades')} className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg"><CheckCircle size={18} /> Ver Calificaciones</button>
                      <button onClick={() => openModal(curso, 'attendance')} className="flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-semibold py-2 px-4 rounded-lg"><ClipboardList size={18} /> Ver Asistencia</button>
                    </div>
                  </div>
                )) : <p>No estás inscrito en ningún curso para el semestre activo.</p>}
              </div>
            )}
          </div>
          
          <aside className="space-y-8">
            {/* --- INICIO DE LA MODIFICACIÓN: Bloque de estado financiero dinámico --- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className={`text-xl font-semibold mb-3 flex items-center gap-2 ${estaAlDia ? 'text-green-600' : 'text-red-600'}`}>
                <DollarSign size={22}/> Estado Financiero
              </h3>
              <p className={`text-2xl font-bold ${estaAlDia ? 'text-green-600' : 'text-red-600'}`}>
                {estadoFinanciero}
              </p>
              <button className={`w-full mt-4 text-white font-semibold py-2 px-4 rounded-lg ${estaAlDia ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {estaAlDia ? 'Ver historial de pagos' : 'Realizar un Pago'}
              </button>
            </div>
            {/* --- FIN DE LA MODIFICACIÓN --- */}
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2"><Bell size={22} className="text-yellow-600"/> Notificaciones</h3>
              <ul className="space-y-3"><li className="text-gray-700">No tienes notificaciones nuevas.</li></ul>
            </div>
          </aside>
        </main>
      </div>

      {/* Modal de Calificaciones */}
      {isGradesModalOpen && selectedCurso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Calificaciones de {selectedCurso.nombre}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
            </div>
            <div>
              <div className="flex justify-between items-center py-3 border-b"><span className="font-semibold">Nota Final</span><span className="text-xl font-bold text-blue-600">{selectedCurso.calificacion}</span></div>
              <div className="flex justify-between items-center py-3 border-b"><span className="font-semibold">Examen Parcial</span><span className="text-gray-500">No registrado</span></div>
              <div className="flex justify-between items-center py-3"><span className="font-semibold">Trabajo Final</span><span className="text-gray-500">No registrado</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Material */}
      {isMaterialModalOpen && selectedCurso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Material de {selectedCurso.nombre}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
            </div>
            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {selectedCurso.materiales && selectedCurso.materiales.length > 0 ? (
                selectedCurso.materiales.map((material, index) => (
                  <li key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="text-gray-500" />
                      <span className="font-medium">{material.nombre}</span>
                    </div>
                    <a href={material.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-200">
                      <Download className="text-blue-600" />
                    </a>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No hay materiales disponibles para este curso.</p>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Modal de Asistencia */}
      {isAttendanceModalOpen && selectedCurso && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Mi Asistencia en {selectedCurso.nombre}</h2>
              <button onClick={closeModal} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
            </div>
            {loadingModal ? <p>Cargando historial...</p> : (
              <div className="max-h-80 overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="py-2 px-4 text-left">Fecha</th>
                      <th className="py-2 px-4 text-left">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.length > 0 ? attendanceRecords.map(record => (
                      <tr key={record.fecha} className="border-b">
                        <td className="py-3 px-4">{record.fecha}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full
                            ${record.estado === 'presente' ? 'bg-green-100 text-green-800' : ''}
                            ${record.estado === 'tarde' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${record.estado === 'ausente' ? 'bg-red-100 text-red-800' : ''}
                          `}>
                            {record.estado.charAt(0).toUpperCase() + record.estado.slice(1)}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="2" className="py-4 text-center text-gray-500">No hay registros de asistencia para este curso.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DefaultDashboard;