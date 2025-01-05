'use client';
import { FaEye, FaTrash, FaEdit } from 'react-icons/fa';

export default function SalesCard({ sale, onViewDetails, onDelete, onEdit }) {
  const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{sale.partyName}</h3>
          <p className="text-sm text-gray-500">{sale.date}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(sale)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
            title="Edit Sale"
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => onDelete(sale.id)}
            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
            title="Delete Sale"
          >
            <FaTrash size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Amount:</span>
          <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Items:</span>
          <span>{sale.items.length}</span>
        </div>
      </div>

      <button
        onClick={() => onViewDetails(sale)}
        className="mt-4 w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
      >
        <FaEye size={16} />
        View Details
      </button>
    </div>
  );
}
