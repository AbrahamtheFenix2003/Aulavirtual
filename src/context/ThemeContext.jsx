import React, { createContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // 'light' es el valor por defecto

  useEffect(() => {
    // Cargar la configuración del tema desde Firestore al iniciar
    const fetchThemeConfig = async () => {
      const configDocRef = doc(db, 'configuracion', 'general');
      const docSnap = await getDoc(configDocRef);
      if (docSnap.exists() && docSnap.data().theme) {
        setTheme(docSnap.data().theme);
      }
    };
    fetchThemeConfig();
  }, []);

  useEffect(() => {
    // Aplicar la clase 'dark' al elemento raíz del HTML
    const root = window.document.documentElement;
    root.classList.remove(theme === 'light' ? 'dark' : 'light');
    root.classList.add(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
