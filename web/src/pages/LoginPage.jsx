import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userData = await login(username, password);

            // Console log para debug (míralo en el navegador F12)
            console.log("Datos recibidos del login:", userData);

            // Verificación ultra-flexible:
            // Comprobamos si el rol es admin (en cualquier caso) o si el usuario escribió "admin"
            const isAdmin =
                userData?.role?.toLowerCase() === 'admin' ||
                username.toLowerCase() === 'admin';

            if (isAdmin) {
                console.log("Redirigiendo a Panel Admin...");
                navigate('/admin', { replace: true });
            } else {
                console.log("Redirigiendo a Tienda...");
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError('Credenciales incorrectas. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Bienvenido</h2>
                    <p className="text-gray-500 mt-2">Ingresa a tu cuenta de QualityStore</p>
                    <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium text-left">
                        <b>ADMIN:</b> admin / 12345<br />
                        <b>CLIENTE:</b> mor_2314 / 83r5^_
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Usuario</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            data-testid="login-username"
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Nombre de usuario"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Contraseña</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            data-testid="login-password"
                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            data-testid="login-error"
                            className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl border border-red-100"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        data-testid="login-button"
                        className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Cargando...' : 'Ingresar'}
                    </button>

                    <p className="text-center text-gray-500 text-sm mt-6">
                        ¿No tienes cuenta? <Link to="/register" data-testid="link-register" className="text-blue-600 font-bold hover:underline">Regístrate gratis</Link>
                    </p>
                </form>
            </motion.div>
        </div>
    );
};


export default LoginPage;
