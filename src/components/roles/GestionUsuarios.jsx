import React, { useState, useEffect } from 'react';
import { db, firebaseConfig } from '../../firebase';
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { UserPlus, ArrowLeft, Pencil, Trash2, X } from 'lucide-react';

const GestionUsuarios = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [createNombre, setCreateNombre] = useState('');
  const [createRol, setCreateRol] = useState('alumno');
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchUsers = async () => {
    const usersCollectionRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);
    const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setUsers(usersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const secondaryApp = initializeApp(firebaseConfig, `secondary-app-${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;
      await setDoc(doc(db, "users", newUser.uid), {
        nombre: createNombre,
        email: email,
        rol: createRol,
        estadoFinanciero: 'Al día' // Se crea por defecto 'Al día'
      });
      setSuccessMessage(`¡Usuario ${createNombre} creado!`);
      setEmail(''); setPassword(''); setCreateNombre(''); setCreateRol('alumno');
      fetchUsers();
    } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
            setErrorMessage('El correo electrónico ya está en uso.');
        } else {
            setErrorMessage('Ocurrió un error al crear el usuario.');
        }
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingUser(null);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    const userRef = doc(db, 'users', editingUser.id);
    try {
      await updateDoc(userRef, {
        nombre: editingUser.nombre,
        rol: editingUser.rol,
        estadoFinanciero: editingUser.estadoFinanciero // Guardar el nuevo estado financiero
      });
      closeEditModal();
      fetchUsers();
    } catch (error) {
      console.error("Error al actualizar usuario: ", error);
    }
  };

  const openDeleteModal = (user) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      await deleteDoc(doc(db, 'users', deletingUser.id));
      closeDeleteModal();
      fetchUsers();
    } catch (error) {
      console.error("Error al eliminar usuario: ", error);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-blue-600 hover:underline">
        <ArrowLeft size={20} /> Volver al Panel Principal
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4">Lista de Usuarios</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Finanzas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">{user.nombre}</td>
                    <td className="px-6 py-4">{user.rol}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.estadoFinanciero === 'Al día' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.estadoFinanciero || 'No definido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => openEditModal(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Pencil size={18} /></button>
                      <button onClick={() => openDeleteModal(user)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><UserPlus /> Crear Nuevo Usuario</h2>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div><label>Nombre Completo</label><input type="text" value={createNombre} onChange={e => setCreateNombre(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md"/></div>
            <div><label>Correo Electrónico</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md"/></div>
            <div><label>Contraseña</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border rounded-md"/></div>
            <div><label>Rol</label><select value={createRol} onChange={e => setCreateRol(e.target.value)} className="mt-1 block w-full px-3 py-2 border rounded-md"><option value="alumno">Alumno</option><option value="profesor">Profesor</option><option value="admin">Administrador</option></select></div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg">Crear Usuario</button>
          </form>
        </div>
      </div>

      {/* Modal de Edición */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Editar Usuario</h2>
              <button onClick={closeEditModal} className="p-2 rounded-full hover:bg-gray-200"><X /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input type="text" value={editingUser.nombre} onChange={e => setEditingUser({...editingUser, nombre: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select value={editingUser.rol} onChange={e => setEditingUser({...editingUser, rol: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md">
                  <option value="alumno">Alumno</option>
                  <option value="profesor">Profesor</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {/* Nuevo campo para el estado financiero */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado Financiero</label>
                <select value={editingUser.estadoFinanciero || 'Al día'} onChange={e => setEditingUser({...editingUser, estadoFinanciero: e.target.value})} className="mt-1 block w-full px-3 py-2 border rounded-md">
                  <option value="Al día">Al día</option>
                  <option value="Con deuda">Con deuda</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={closeEditModal} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && deletingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4">¿Estás seguro?</h2>
            <p className="text-gray-600 mb-6">Estás a punto de eliminar a <span className="font-bold">{deletingUser.nombre}</span>. Esta acción no se puede deshacer.</p>
            <div className="flex justify-center gap-4">
              <button onClick={closeDeleteModal} className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">Cancelar</button>
              <button onClick={handleDeleteUser} className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionUsuarios;
