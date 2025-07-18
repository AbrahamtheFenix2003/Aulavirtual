import React, { useState, useEffect, useContext } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ArrowLeft, Settings, Save, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../../context/ThemeContext'; // Importar el contexto del tema

const ConfiguracionGeneral = ({ onBack }) => {
  const [config, setConfig] = useState({ nombreAcademia: '', theme: 'light' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { theme, setTheme } = useContext(ThemeContext); // Usar el contexto para acceder y modificar el tema
  const configDocRef = doc(db, 'configuracion', 'general');

  useEffect(() => {
    const fetchConfig = async () => {
      const docSnap = await getDoc(configDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig(data);
        setTheme(data.theme || 'light'); // Establecer el tema de la app según los datos guardados
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme); // Cambiar el tema en toda la app
    setConfig(prev => ({ ...prev, theme: newTheme })); // Actualizar el estado local para guardarlo
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    try {
      // Guardar la configuración completa, incluyendo el tema, en Firestore
      await setDoc(configDocRef, config, { merge: true });
      setSuccessMessage('¡Cambios guardados con éxito!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error("Error al guardar la configuración: ", error);
      alert("No se pudieron guardar los cambios.");
    }
    setSaving(false);
  };

  if (loading) return <div>Cargando configuración...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400 hover:underline">
        <ArrowLeft size={20} />
        Volver al Panel Principal
      </button>
      
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="flex items-center gap-4 mb-6">
          <Settings className="h-10 w-10 text-gray-500 dark:text-gray-300" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración General</h1>
            <p className="text-gray-600 dark:text-gray-400">Ajustes globales de la plataforma.</p>
          </div>
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div>
            <label htmlFor="nombreAcademia" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Nombre de la Academia
            </label>
            <input
              type="text"
              name="nombreAcademia"
              id="nombreAcademia"
              value={config.nombreAcademia}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ej: Academia Virtual Pro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Tema de la Aplicación</label>
            <div className="mt-2 flex items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <button type="button" onClick={toggleTheme} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${theme === 'light' ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}>
                <Sun /> Claro
              </button>
              <button type="button" onClick={toggleTheme} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${theme === 'dark' ? 'bg-gray-900 shadow text-blue-400' : 'text-gray-500'}`}>
                <Moon /> Oscuro
              </button>
            </div>
          </div>

          <div className="flex justify-end items-center gap-4 pt-4">
            {successMessage && <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>}
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfiguracionGeneral;
