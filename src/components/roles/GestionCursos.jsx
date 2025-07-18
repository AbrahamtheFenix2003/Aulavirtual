import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { getStorage, ref, deleteObject, listAll } from "firebase/storage";
import { collection, getDocs, addDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { ArrowLeft, BookPlus, Trash2, X, Info } from 'lucide-react';
import DetalleCurso from './DetalleCurso';

const GestionCursos = ({ onBack }) => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [vista, setVista] = useState('lista');
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState(null);

  const [semestres, setSemestres] = useState([]);
  const [selectedSemestre, setSelectedSemestre] = useState('');
  
  // --- INICIO DE NUEVOS ESTADOS ---
  const [activeSemestre, setActiveSemestre] = useState(null); // Para guardar el semestre activo
  // --- FIN DE NUEVOS ESTADOS ---

  const [nombreCurso, setNombreCurso] = useState('');
  const [descripcionCurso, setDescripcionCurso] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    // 1. Buscar el semestre activo
    const semestresQuery = query(collection(db, 'semestres'), where('estado', '==', 'activo'));
    const semestresSnapshot = await getDocs(semestresQuery);
    let activeSemestreData = null;
    if (!semestresSnapshot.empty) {
      const activeDoc = semestresSnapshot.docs[0];
      activeSemestreData = { id: activeDoc.id, ...activeDoc.data() };
      setActiveSemestre(activeSemestreData);
    } else {
      setLoading(false);
      return; // No hacer nada si no hay semestre activo
    }

    // 2. Cargar solo los cursos del semestre activo
    const cursosQuery = query(collection(db, 'cursos'), where('semestreId', '==', activeSemestreData.id));
    const cursosSnapshot = await getDocs(cursosQuery);
    const cursosList = cursosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCursos(cursosList);

    // Cargar todos los semestres para el dropdown de creación
    const allSemestresSnapshot = await getDocs(collection(db, 'semestres'));
    const semestresList = allSemestresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSemestres(semestresList);
    
    setLoading(false);
  };

  useEffect(() => {
    if (vista === 'lista') {
      fetchData();
    }
  }, [vista]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!selectedSemestre) {
      alert("Por favor, selecciona un semestre.");
      return;
    }
    setSuccessMessage('');
    try {
      await addDoc(collection(db, 'cursos'), {
        nombre: nombreCurso,
        descripcion: descripcionCurso,
        semestreId: selectedSemestre,
        profesorId: null,
        alumnosInscritos: []
      });
      setSuccessMessage(`¡Curso "${nombreCurso}" creado!`);
      setNombreCurso('');
      setDescripcionCurso('');
      fetchData();
    } catch (error) {
      console.error("Error al crear el curso: ", error);
      alert("Ocurrió un error al crear el curso.");
    }
  };

  // ... (las funciones de detalle y borrado no cambian) ...
  const verDetalleCurso = (id) => { setCursoSeleccionadoId(id); setVista('detalle'); };
  const openDeleteModal = (curso) => { setDeletingCourse(curso); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => { setDeletingCourse(null); setIsDeleteModalOpen(false); };
  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    try {
      const storage = getStorage();
      const courseFolderRef = ref(storage, `cursos/${deletingCourse.id}/materiales`);
      const fileList = await listAll(courseFolderRef);
      const deletePromises = fileList.items.map(fileRef => deleteObject(fileRef));
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, 'cursos', deletingCourse.id));
      closeDeleteModal();
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el curso y sus archivos: ", error);
      alert("Ocurrió un error al eliminar el curso.");
    }
  };

  if (loading) return <div>Cargando...</div>;

  if (vista === 'detalle') {
    return <DetalleCurso cursoId={cursoSeleccionadoId} onBack={() => setVista('lista')} />;
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver al Panel Principal
      </button>

      {/* Mensaje informativo del semestre activo */}
      {activeSemestre ? (
        <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6 rounded-r-lg" role="alert">
          <p className="font-bold">Semestre Activo: {activeSemestre.nombre}</p>
          <p>Mostrando únicamente los cursos de este semestre.</p>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg" role="alert">
          <p className="font-bold">¡Atención!</p>
          <p>No hay ningún semestre marcado como 'activo'. Por favor, ve a "Gestión de Semestres" y activa uno para continuar.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Lista de Cursos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cursos.map(curso => (
                    <tr key={curso.id} onClick={() => verDetalleCurso(curso.id)} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 font-medium">{curso.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{curso.descripcion}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={(e) => { e.stopPropagation(); openDeleteModal(curso); }} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BookPlus/> Crear Nuevo Curso</h2>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
            <div><label className="block text-sm font-medium text-gray-700">Nombre del Curso</label><input type="text" value={nombreCurso} onChange={e => setNombreCurso(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md"/></div>
            <div><label className="block text-sm font-medium text-gray-700">Descripción Breve</label><textarea value={descripcionCurso} onChange={e => setDescripcionCurso(e.target.value)} required rows="3" className="mt-1 block w-full px-3 py-2 border rounded-md"></textarea></div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Semestre</label>
              <select value={selectedSemestre} onChange={e => setSelectedSemestre(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md">
                <option value="" disabled>Selecciona un semestre</option>
                {semestres.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md text-white bg-blue-600 hover:bg-blue-700">Crear Curso</button>
          </form>
        </div>
      </div>

      {isDeleteModalOpen && deletingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">¿Estás seguro?</h2>
            <p className="text-gray-600 mb-6">Estás a punto de eliminar el curso <span className="font-bold">{deletingCourse.nombre}</span> y todo su material. Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button onClick={closeDeleteModal} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button onClick={handleDeleteCourse} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionCursos;
