import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || '');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchTerm) params.q = searchTerm;
            if (category) params.category = category;

            const res = await api.get('/products', { params });
            setProducts(res.data);
        } catch (err) {
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchParams]); // Refetch when URL params change

    const handleSearch = (e) => {
        e.preventDefault();
        setSearchParams({ q: searchTerm, category });
    };

    const handleAddToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existing = cart.find(item => item.productId === product._id);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ productId: product._id, qty: 1, product });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`Added ${product.name} to cart!`);
    };

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900">Menu</h1>

                <form onSubmit={handleSearch} className="flex w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search food..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                    />
                    <button type="submit" className="bg-orange-600 text-white px-4 py-2 rounded-r-md hover:bg-orange-700">
                        <Search className="h-5 w-5" />
                    </button>
                </form>
            </div>

            {/* Categories Filter (Simple) */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {['', 'Pizza', 'Burger', 'Sushi', 'Thai', 'Italian', 'American'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => {
                            setCategory(cat);
                            setSearchParams({ q: searchTerm, category: cat });
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${category === cat
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {cat || 'All'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <ProductCard
                            key={product._id}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                    {products.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No products found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductList;
