import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { token } = useAuth();
    const [orderProcessed, setOrderProcessed] = useState(false);

    const handleCheckout = () => {

        if (cartItems.length === 0) return;
        setOrderProcessed(true);
        clearCart();
    };

    if (orderProcessed) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center bg-white p-12 rounded-3xl shadow-2xl max-w-lg"
                >
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2" data-testid="order-success-title">¡Orden procesada con éxito!</h2>
                    <p className="text-gray-500 mb-8 text-lg">Gracias por confiar en QualityStore. Tu pedido está en camino.</p>
                    <Link
                        to="/"
                        className="inline-block bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 transition-all"
                    >
                        Volver a la tienda
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-black text-gray-900 mb-10 tracking-tight">Tu Carrito</h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <p className="text-gray-400 text-xl font-medium mb-6">Tu carrito está vacío.</p>
                        <Link to="/" className="text-blue-600 font-bold text-lg hover:underline">Explorar productos</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-6">
                            <AnimatePresence>
                                {cartItems.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6"
                                    >
                                        <img src={item.image} alt={item.title} className="w-24 h-24 object-contain rounded-lg" />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-gray-900 font-bold truncate">{item.title}</h3>
                                            <p className="text-gray-500 font-medium">${item.price}</p>
                                        </div>
                                        <div className="flex items-center space-x-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                data-testid={`decrease-qty-${item.id}`}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors font-bold"
                                            >
                                                -
                                            </button>
                                            <span className="font-bold w-4 text-center" data-testid={`item-qty-${item.id}`}>{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                data-testid={`increase-qty-${item.id}`}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors font-bold"
                                            >
                                                +
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            data-testid={`remove-item-${item.id}`}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 sticky top-24">
                                <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Resumen</h2>
                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between text-gray-500 font-medium">
                                        <span>Subtotal</span>
                                        <span>${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 font-medium">
                                        <span>Envío</span>
                                        <span className="text-green-600 font-bold">Gratis</span>
                                    </div>
                                    <div className="border-t pt-4 flex justify-between items-center">
                                        <span className="text-xl font-black text-gray-900">Total</span>
                                        <span className="text-3xl font-black text-blue-600" data-testid="cart-total-price">
                                            ${cartTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    data-testid="checkout-button"
                                    className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-xl hover:bg-blue-600 transition-all duration-300 active:scale-95 shadow-lg shadow-gray-200"
                                >
                                    Finalizar Compra
                                </button>

                                <p className="mt-4 text-xs text-gray-400 text-center">
                                    Al continuar aceptas nuestros términos de servicio.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
