import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        // Mantenemos estos en el estado local para que el formulario no rompa,
        // pero NO los enviaremos en el payload final según tu documentación.
        phone: '',
        firstname: '',
        lastname: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                username: initialData.username || '',
                email: initialData.email || '',
                password: initialData.password || '',
                phone: initialData.phone || '',
                firstname: initialData.name?.firstname || '',
                lastname: initialData.name?.lastname || ''
            });
        } else {
            setFormData({
                username: '',
                email: '',
                password: '',
                phone: '',
                firstname: '',
                lastname: ''
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // --- EL CAMBIO CLAVE ESTÁ AQUÍ ---
        // Construimos el payload siguiendo ESTRICTAMENTE tu documentación:
        // { "id": 0, "username": "string", "email": "string", "password": "string" }
        const payload = {
            id: initialData?.id || 0, // Si es nuevo, mandamos 0 como pide el sample
            username: formData.username,
            email: formData.email,
            password: formData.password
        };

        console.log("Payload limpio enviado al servidor:", payload);
        onSubmit(payload);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
                >
                    <div className="p-8 border-b flex justify-between items-center bg-gray-50">
                        <h2 className="text-2xl font-black text-gray-900">
                            {initialData ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Mantenemos los inputs de nombre/apellido/teléfono por si quieres 
                                que el formulario se vea completo, pero recuerda que NO se guardarán 
                                porque tu API no los pide.
                            */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre (Visual)</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Apellido (Visual)</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:outline-none"
                                />
                            </div>

                            {/* CAMPOS REQUERIDOS POR LA API */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Usuario *</label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    data-testid="admin-user-username"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-blue-100 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    data-testid="admin-user-email"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-blue-100 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña *</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    data-testid="admin-user-password"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-blue-100 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono (Visual)</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 bg-gray-100 border-2 border-transparent rounded-xl focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                data-testid="admin-save-user"
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                {initialData ? 'Guardar Cambios' : 'Crear Usuario'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default UserFormModal;