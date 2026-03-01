import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        image: '',
        category: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                title: '',
                price: '',
                description: '',
                image: '',
                category: ''
            });
        }
    }, [initialData, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ ...formData, price: parseFloat(formData.price) });
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
                    <div className="p-8 border-b flex justify-between items-center">
                        <h2 className="text-2xl font-black text-gray-900">
                            {initialData ? 'Editar Producto' : 'Subir Nuevo Producto'}
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Título</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    data-testid="admin-product-title"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Precio ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    name="price"
                                    required
                                    value={formData.price}
                                    onChange={handleChange}
                                    data-testid="admin-product-price"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                                <input
                                    type="text"
                                    name="category"
                                    required
                                    value={formData.category}
                                    onChange={handleChange}
                                    data-testid="admin-product-category"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">URL de Imagen</label>
                                <input
                                    type="url"
                                    name="image"
                                    required
                                    value={formData.image}
                                    onChange={handleChange}
                                    data-testid="admin-product-image"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                                <textarea
                                    name="description"
                                    required
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    data-testid="admin-product-description"
                                    className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all resize-none"
                                ></textarea>
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
                                data-testid="admin-save-product"
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                            >
                                {initialData ? 'Guardar Cambios' : 'Crear Producto'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProductFormModal;
