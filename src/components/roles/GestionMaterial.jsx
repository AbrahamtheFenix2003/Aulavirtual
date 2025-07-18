import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ArrowLeft, UploadCloud, File, Download } from 'lucide-react';

const GestionMaterial = ({ cursoId, onBack }) => {
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const storage = getStorage();

  const fetchCursoData = async () => {
    const cursoRef = doc(db, 'cursos', cursoId);
    const cursoSnap = await getDoc(cursoRef);
    if (cursoSnap.exists()) {
      setCurso(cursoSnap.data());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCursoData();
  }, [cursoId]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const fileRef = ref(storage, `cursos/${cursoId}/materiales/${selectedFile.name}`);
    
    try {
      // 1. Subir el archivo a Storage
      await uploadBytes(fileRef, selectedFile);
      
      // 2. Obtener la URL de descarga
      const downloadURL = await getDownloadURL(fileRef);
      
      // 3. Guardar la información del archivo en Firestore
      const cursoRef = doc(db, 'cursos', cursoId);
      await updateDoc(cursoRef, {
        materiales: arrayUnion({
          nombre: selectedFile.name,
          url: downloadURL,
          fechaSubida: new Date()
        })
      });

      setSuccessMessage('¡Archivo subido con éxito!');
      setSelectedFile(null);
      fetchCursoData(); // Recargar datos para mostrar el nuevo archivo
    } catch (error) {
      console.error("Error al subir archivo: ", error);
      setErrorMessage('No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} />
        Volver a Mis Cursos
      </button>
      <h1 className="text-3xl font-bold mb-4">Material Didáctico: {curso?.nombre}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna de subida */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><UploadCloud /> Subir Nuevo Material</h2>
          <div className="space-y-4">
            <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <button onClick={handleUpload} disabled={!selectedFile || uploading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
              {uploading ? 'Subiendo...' : 'Subir Archivo'}
            </button>
            {successMessage && <p className="text-green-600">{successMessage}</p>}
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          </div>
        </div>

        {/* Columna de materiales existentes */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Materiales Disponibles</h2>
          <ul className="space-y-3">
            {curso?.materiales && curso.materiales.length > 0 ? (
              curso.materiales.map((material, index) => (
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
              <p className="text-gray-500">No hay materiales para este curso.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GestionMaterial;
