import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        const savedUsername = localStorage.getItem('username');
        const savedRole = localStorage.getItem('role');

        if (savedToken) {
            setToken(savedToken);
            setUser({
                username: savedUsername || 'user',
                role: savedRole || 'client'
            });
        }
    }, []);

    const login = async (username, password) => {
        try {

            const response = await fetch('http://localhost:3001/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) throw new Error('Credenciales incorrectas');

            const data = await response.json();

            localStorage.setItem('token', data.token);
            localStorage.setItem('username', data.username);
            localStorage.setItem('role', data.role);

            setToken(data.token);
            setUser({ username: data.username, role: data.role });

            return true;
        } catch (err) {
            console.error("Error en login:", err);
            throw err;
        }
    };



    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
