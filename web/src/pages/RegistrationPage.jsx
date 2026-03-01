import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password
        };


        try {
            const response = await fetch('http://localhost:3001/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Crea tu Cuenta</h2>
                    <p className="text-gray-500 mt-2">Únete a la mejor experiencia de compra</p>
                </div>

                {success ? (
                    <div className="text-center bg-green-50 p-8 rounded-2xl">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-green-800 mb-2">¡Registro Exitoso!</h3>
                        <p className="text-green-700">Redirigiendo al login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    name="firstname"
                                    required
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    data-testid="register-firstname"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Apellido</label>
                                <input
                                    type="text"
                                    name="lastname"
                                    required
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    data-testid="register-lastname"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Usuario</label>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    value={formData.username}
                                    onChange={handleChange}
                                    data-testid="register-username"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    data-testid="register-email"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    data-testid="register-password"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    data-testid="register-phone"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            data-testid="register-submit"
                            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-all duration-300 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Registrarse'}
                        </button>

                        <p className="text-center text-gray-500 text-sm">
                            ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 font-bold hover:underline">Ingresa aquí</Link>
                        </p>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default RegistrationPage;
