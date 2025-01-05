'use client';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

export default function PaymentCard({ payment, onStatusChange, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{payment.partyName}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          payment.status === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {payment.status}
        </span>
      </div>
      
      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900">₹{payment.amount}</p>
        <p className="text-sm text-gray-500">Due Date: {payment.date}</p>
      </div>

      <div className="flex justify-end space-x-3 border-t pt-3">
        {/* <button 
          onClick={() => onEdit(payment)}
          className="text-blue-600 hover:text-blue-800 p-2"
          aria-label="Edit payment"
        >
          <FaEdit size={18} />
        </button> */}
        <button 
          onClick={() => onDelete(payment.id)}
          className="text-red-600 hover:text-red-800 p-2"
          aria-label="Delete payment"
        >
          <FaTrash size={18} />
        </button>
        <button 
          onClick={() => onStatusChange(payment.id)}
          className={`${
            payment.status === 'pending' 
              ? 'text-green-600 hover:text-green-800' 
              : 'text-yellow-600 hover:text-yellow-800'
          } p-2`}
          aria-label="Toggle payment status"
        >
          {payment.status === 'pending' ? <FaCheck size={18} /> : <FaTimes size={18} />}
        </button>
      </div>
    </div>
  );
}
