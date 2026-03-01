import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import ProductFormModal from '../components/ProductFormModal';
import UserFormModal from '../components/UserFormModal';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [notification, setNotification] = useState(null);


    useEffect(() => {
        if (user?.role !== 'admin') return;
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [prodRes, userRes] = await Promise.all([
                fetch('http://localhost:3001/api/products'),
                fetch('http://localhost:3001/api/users')
            ]);
            const [prodData, userData] = await Promise.all([prodRes.json(), userRes.json()]);
            setProducts(prodData);
            setUsers(userData);
        } catch (err) {
            console.error('Failed to fetch admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (formData) => {
        const url = editingProduct
            ? `http://localhost:3001/api/products/${editingProduct.id}`
            : 'http://localhost:3001/api/products';
        const method = editingProduct ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const savedProduct = await response.json();

                // --- ACTUALIZACIÓN OPTIMISTA (SIN RECARGAR TODO) ---
                if (editingProduct) {
                    setProducts(prev => prev.map(p => p.id === editingProduct.id ? savedProduct : p));
                } else {
                    setProducts(prev => [savedProduct, ...prev]);
                }

                showNotification(editingProduct ? 'Producto actualizado' : 'Producto creado exitosamente');
                closeModal();
            }
        } catch (err) {
            console.error("Error al guardar producto:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
        try {
            const response = await fetch(`http://localhost:3001/api/products/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showNotification('Producto eliminado');
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const showNotification = (msg) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 3000);
    };

    const openModal = (product = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingProduct(null);
        setIsModalOpen(false);
    };

    const handleCreateOrUpdateUser = async (userData) => {
        try {
            const url = editingUser
                ? `http://localhost:3001/api/users/${editingUser.id}`
                : 'http://localhost:3001/api/users';
            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (response.ok) {
                const savedUser = await response.json();

                // --- EL TRUCO PARA QUE APAREZCA SÍ O SÍ ---
                if (editingUser) {
                    setUsers(prev => prev.map(u => u.id === editingUser.id ? savedUser : u));
                } else {
                    // Si es nuevo, le damos un ID único temporal por si la API repite IDs
                    const userWithId = {
                        ...savedUser,
                        id: savedUser.id || Date.now(), // Usa la fecha como ID si la API falla
                        password: userData.password // Aseguramos que la pass se mantenga
                    };
                    setUsers(prev => [userWithId, ...prev]);
                }

                showNotification(editingUser ? 'Actualizado' : '¡Creado con éxito!');
                closeUserModal();
            }
        } catch (err) {
            console.error("Error al guardar usuario:", err);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;
        try {
            const response = await fetch(`http://localhost:3001/api/users/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showNotification('Usuario eliminado');
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openUserModal = (user = null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const closeUserModal = () => {
        setEditingUser(null);
        setIsUserModalOpen(false);
    };

    if (user?.role !== 'admin') return <Navigate to="/" />;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Panel de Control</h1>
                    <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex space-x-2">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Productos
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            Usuarios
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === 'products' ? (
                        <motion.div
                            key="products"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Gestión de Catálogo</h2>
                                <button
                                    onClick={() => openModal()}
                                    data-testid="admin-add-product"
                                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Nuevo Producto
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 font-bold text-gray-700">Producto</th>
                                            <th className="px-6 py-4 font-bold text-gray-700">Categoría</th>
                                            <th className="px-6 py-4 font-bold text-gray-700">Precio</th>
                                            <th className="px-6 py-4 font-bold text-gray-700 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr><td colSpan="4" className="text-center py-10">Cargando catálogo...</td></tr>
                                        ) : (
                                            products.map(product => (
                                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center space-x-3">
                                                            <img src={product.image} className="w-10 h-10 object-contain" alt="" />
                                                            <span className="font-medium text-gray-900 truncate max-w-xs">{product.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 uppercase text-xs font-bold">{product.category}</td>
                                                    <td className="px-6 py-4 font-black">${product.price}</td>
                                                    <td className="px-6 py-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => openModal(product)}
                                                            data-testid={`admin-edit-${product.id}`}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id)}
                                                            data-testid={`admin-delete-${product.id}`}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="users"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Cuentas de Clientes</h2>
                                <button
                                    onClick={() => openUserModal()}
                                    data-testid="admin-add-user"
                                    className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Nuevo Usuario
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {users.map(u => (
                                    <div key={u.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-600 relative group transition-all hover:shadow-md">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="font-bold text-gray-900 text-lg uppercase">{u.username}</h3>
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                        ID: {u.id}
                                                    </span>
                                                </div>

                                                {u.name ? (
                                                    <p className="text-gray-500 text-sm italic">{u.name.firstname} {u.name.lastname}</p>
                                                ) : (
                                                    <p className="text-gray-500 text-sm italic">Usuario Nuevo</p>
                                                )}

                                                <p className="text-gray-400 text-xs mt-1">{u.email}</p>
                                            </div>

                                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openUserModal(u)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Editar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(u.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                    title="Eliminar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* SECCIÓN DE CONTRASEÑA Y DATOS EXTRA */}
                                        <div className="pt-4 border-t space-y-2">
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-gray-400 font-bold uppercase tracking-wider">Contraseña:</span>
                                                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                    {u.password || '********'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="text-gray-400 font-bold uppercase tracking-wider">Teléfono:</span>
                                                <span className="text-gray-600">{u.phone || 'No registrado'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSubmit={handleCreateOrUpdate}
                initialData={editingProduct}
            />

            <UserFormModal
                isOpen={isUserModalOpen}
                onClose={closeUserModal}
                onSubmit={handleCreateOrUpdateUser}
                initialData={editingUser}
            />

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center space-x-3 z-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
