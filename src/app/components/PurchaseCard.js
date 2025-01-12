// components/PurchaseCard.js
'use client';
import { useState } from 'react';
import { FaEdit, FaTrash, FaImage, FaTimes } from 'react-icons/fa';

export default function PurchaseCard({ purchase, onEdit, onDelete }) {
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);

  const InvoicePreview = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white rounded-lg p-4 max-w-3xl w-full">
        <button
          onClick={() => setShowInvoicePreview(false)}
          className="absolute top-2 right-2 text-red-500 hover:text-gray-700"
        >
          <FaTimes size={24} />
        </button>
        <img
          src={purchase.invoiceImgUrl}
          alt="Invoice"
          className="w-full h-auto"
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{purchase.partyName}</h3>
            <p className="text-sm text-gray-500">{purchase.date}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(purchase)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
              title="Edit Purchase"
            >
              <FaEdit size={16} />
            </button>
            <button
              onClick={() => onDelete(purchase.id)}
              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
              title="Delete Purchase"
            >
              <FaTrash size={16} />
            </button>
            {purchase.invoiceImgUrl && (
              <button
                onClick={() => setShowInvoicePreview(true)}
                className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50 transition-colors"
                title="View Invoice"
              >
                <FaImage size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold text-lg">₹{parseFloat(purchase.amount).toLocaleString()}</span>
          </div>
          
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Items:</h4>
            <ul className="space-y-1">
              {purchase.items.map((item, index) => (
                <li key={index} className="text-sm text-gray-600 flex justify-between">
                  <span>{item.name}</span>
                  <span className="font-medium">{item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {showInvoicePreview && <InvoicePreview />}
    </>
  );
}