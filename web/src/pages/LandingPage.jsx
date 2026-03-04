import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import ProductGrid from '../components/ProductGrid';

const LandingPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async (query = '') => {

        console.log("🔍 Intentando buscar:", query);

        setLoading(true);
        try {

            const queryString = typeof query === 'string' ? query : '';
            const url = queryString
                ? `http://localhost:3001/api/products/search?q=${encodeURIComponent(queryString.trim())}`
                : 'http://localhost:3001/api/products';

            console.log("📡 URL de petición:", url);

            const response = await fetch(url);
            const data = await response.json();

            console.log("✅ Datos recibidos:", data);
            setProducts(data);
        } catch (err) {
            console.error("❌ Error en fetch:", err);
            setError('Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <>
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                    Premium Quality, Resilient Tech.
                </h2>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12">
                    Experience the best E-commerce hub built for testing and high performance.
                </p>
                <SearchBar onSearch={fetchProducts} />
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500 font-medium">
                        {error}
                    </div>
                ) : (
                    <ProductGrid products={products} />
                )}
            </main>
        </>
    );
};

export default LandingPage;
