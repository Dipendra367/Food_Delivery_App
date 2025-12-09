import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
          {product.cuisine}
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-orange-600">
            NPR {product.price}
          </span>
        </div>
        <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">{product.description}</p>
        <div className="flex justify-between items-center pt-2 border-t border-gray-50">
          <Link
            to={`/products/${product._id}`}
            className="text-gray-600 hover:text-orange-600 text-sm font-medium transition-colors"
          >
            View Details
          </Link>
          <button
            onClick={() => onAddToCart(product)}
            disabled={!product.inStock}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${product.inStock
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {product.inStock ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;