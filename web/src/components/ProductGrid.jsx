import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-shadow duration-300 group flex flex-col h-full">
            <Link to={`/product/${product.id}`} className="h-64 overflow-hidden relative p-4 block">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {product.category}
                </div>
            </Link>
            <div className="p-6 flex flex-col flex-1">
                <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition-colors">
                    <h3 className="text-gray-800 font-bold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                        {product.title}
                    </h3>
                </Link>
                <div className="flex items-center justify-between mt-auto pt-4">
                    <span className="text-2xl font-black text-gray-900">${product.price}</span>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            addToCart(product);
                        }}
                        data-testid={`add-to-cart-${product.id}`}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-600 active:scale-95 transition-all duration-200"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

const ProductGrid = ({ products }) => {
    if (products.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-400 text-xl font-medium" data-testid="results-empty">
                    No products found. Try a different search.
                </p>
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            data-testid="products-grid"
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
};

export default ProductGrid;
