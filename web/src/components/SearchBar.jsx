import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl mx-auto mb-10">
            <input
                type="text"
                placeholder="Search products by title or category (e.g. electronics)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                data-testid="search-input"
                className="w-full px-6 py-4 text-lg border-2 border-transparent bg-white shadow-xl rounded-full focus:outline-none focus:border-blue-500 transition-all duration-300 placeholder:text-gray-400"
            />
            <button
                type="submit"
                data-testid="search-button"
                className="absolute right-3 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 active:scale-95 transition-all duration-200"
            >
                Search
            </button>
        </form>
    );
};

export default SearchBar;
