// src/firebase.js

// Importa las funciones que necesitas de los SDKs que necesitas
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// La configuración de tu proyecto de Firebase
// ¡Ve a la consola de Firebase > Configuración del proyecto para obtener estos datos!
const firebaseConfig = {
  apiKey: "AIzaSyBpaEicEParLMKfBHFyaafY7lRBOxp4DZE",
  authDomain: "aula-virtual-b2ee1.firebaseapp.com",
  projectId: "aula-virtual-b2ee1",
  storageBucket: "aula-virtual-b2ee1.firebasestorage.app",
  messagingSenderId: "718309399233",
  appId: "1:718309399233:web:7841e35f4940e097049240",
  measurementId: "G-M133CQMKXF"
};


// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta los servicios de Firebase para que puedas usarlos en toda tu app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);