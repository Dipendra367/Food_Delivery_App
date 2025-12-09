import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileText } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No orders found.</div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-500">Order ID: {order._id}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                  <span className="font-bold text-gray-900">NPR {order.total.toFixed(2)}</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-4 mb-4">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-8">{item.qty}x</span>
                        <span className="font-medium text-gray-900">
                          {item.productId ? item.productId.name : 'Unknown Item'}
                        </span>
                      </div>
                      <span className="text-gray-600">NPR {item.price}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => navigate(`/receipt/${order._id}`)}
                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;