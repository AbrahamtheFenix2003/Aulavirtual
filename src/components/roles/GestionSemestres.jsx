import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, doc, writeBatch } from 'firebase/firestore';
import { ArrowLeft, CalendarPlus, CheckCircle } from 'lucide-react';

const GestionSemestres = ({ onBack }) => {
  const [semestres, setSemestres] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [nombreSemestre, setNombreSemestre] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchSemestres = async () => {
    setLoading(true);
    const semestresCollectionRef = collection(db, 'semestres');
    const querySnapshot = await getDocs(semestresCollectionRef);
    const semestresList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ordenar para mostrar los activos primero
    semestresList.sort((a, b) => (a.estado === 'activo' ? -1 : 1));
    setSemestres(semestresList);
    setLoading(false);
  };

  useEffect(() => {
    fetchSemestres();
  }, []);

  const handleCreateSemester = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    try {
      await addDoc(collection(db, 'semestres'), {
        nombre: nombreSemestre,
        estado: 'cerrado', // Los nuevos semestres se crean como cerrados por defecto
        fechaCreacion: new Date()
      });
      setSuccessMessage(`¡Semestre "${nombreSemestre}" creado!`);
      setNombreSemestre('');
      fetchSemestres();
    } catch (error) {
      console.error("Error al crear el semestre: ", error);
      alert("Ocurrió un error al crear el semestre.");
    }
  };

  // --- INICIO DE NUEVA FUNCIÓN ---
  const handleSetActive = async (semestreIdToActivate) => {
    const batch = writeBatch(db);

    // 1. Encontrar el semestre actualmente activo (si lo hay) y ponerlo como 'cerrado'
    const currentActive = semestres.find(s => s.estado === 'activo');
    if (currentActive) {
      const oldActiveRef = doc(db, 'semestres', currentActive.id);
      batch.update(oldActiveRef, { estado: 'cerrado' });
    }

    // 2. Poner el nuevo semestre como 'activo'
    const newActiveRef = doc(db, 'semestres', semestreIdToActivate);
    batch.update(newActiveRef, { estado: 'activo' });

    // 3. Ejecutar ambas operaciones a la vez
    try {
      await batch.commit();
      fetchSemestres(); // Recargar la lista para ver los cambios
    } catch (error) {
      console.error("Error al cambiar el semestre activo: ", error);
      alert("No se pudo actualizar el semestre activo.");
    }
  };
  // --- FIN DE NUEVA FUNCIÓN ---

  if (loading) return <div>Cargando semestres...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver al Panel Principal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Lista de Semestres</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {semestres.map(semestre => (
                  <tr key={semestre.id}>
                    <td className="px-6 py-4 font-medium">{semestre.nombre}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${semestre.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {semestre.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {semestre.estado === 'cerrado' && (
                        <button onClick={() => handleSetActive(semestre.id)} className="text-blue-600 hover:text-blue-800 font-semibold">
                          Marcar como Activo
                        </button>
                      )}
                      {semestre.estado === 'activo' && (
                        <span className="flex items-center justify-center text-green-600 font-bold"><CheckCircle size={20} /></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <CalendarPlus size={24} />
            Crear Nuevo Semestre
          </h2>
          <form onSubmit={handleCreateSemester}>
            <div className="space-y-4">
              {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Semestre</label>
                <input type="text" value={nombreSemestre} onChange={e => setNombreSemestre(e.target.value)} placeholder="Ej: 2026-I" required className="mt-1 block w-full px-3 py-2 border rounded-md"/>
              </div>
              <button type="submit" className="w-full flex justify-center py-2 px-4 border rounded-md text-white bg-blue-600 hover:bg-blue-700">
                Crear Semestre
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GestionSemestres;
