'use client';

export default function SalesDetailsModal({ isOpen, onClose, sale }) {
  if (!isOpen || !sale) return null;

  const totalAmount = sale.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{sale.partyName}</h2>
            <p className="text-sm text-gray-500">Date: {sale.date}</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">₹{totalAmount}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Items</h3>
          <div className="divide-y divide-gray-200">
            {sale.items.map((item, index) => (
              <div key={index} className="py-4 first:pt-0 last:pb-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Product</p>
                    <p className="mt-1">{item.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Item Name</p>
                    <p className="mt-1">{item.itemName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Quantity</p>
                    <p className="mt-1">{item.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="mt-1">₹{item.price}</p>
                  </div>
                </div>
                <p className="mt-2 text-right text-sm font-medium text-gray-900">
                  Subtotal: ₹{item.quantity * item.price}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
