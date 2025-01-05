'use client';
import { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const PRODUCT_OPTIONS = [
  'Addison',
  'Norton Alkon',
  'Bosch',
  'Yuri',
  'Surie Mirrex',
  'Hikoki'
];

const DEFAULT_FORM_DATA = {
  partyName: '',
  date: new Date().toISOString().split('T')[0],
  items: [{ productName: '', itemName: '', quantity: '', price: '' }]
};

export default function AddSalesModal({ isOpen, onClose, onSubmit, initialData = null }) {
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [expandedItems, setExpandedItems] = useState([0]);

  // Initialize form with data if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        partyName: initialData.partyName,
        date: initialData.date,
        items: initialData.items.map(item => ({
          productName: item.productName,
          itemName: item.itemName,
          quantity: item.quantity,
          price: item.price
        }))
      });
      // Expand all items when editing
      setExpandedItems(initialData.items.map((_, index) => index));
    } else {
      setFormData(DEFAULT_FORM_DATA);
      setExpandedItems([0]);
    }
  }, [initialData, isOpen]);

  const addItem = () => {
    const newItemIndex = formData.items.length;
    setFormData({
      ...formData,
      items: [...formData.items, { productName: '', itemName: '', quantity: '', price: '' }]
    });
    setExpandedItems(prev => [...prev, newItemIndex]);
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    setExpandedItems(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
  };

  const updateItem = (index, field, value) => {
    const newItems = formData.items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setFormData({ ...formData, items: newItems });
  };

  const toggleItem = (index) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData(DEFAULT_FORM_DATA);
    setExpandedItems([0]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Sale' : 'Add New Sale'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Party Name</label>
              <input
                type="text"
                value={formData.partyName}
                onChange={(e) => setFormData({...formData, partyName: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <FaPlus size={14} />
                  Add Item
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div 
                    className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleItem(index)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedItems.includes(index) ? <FaChevronDown /> : <FaChevronRight />}
                      <span className="font-medium">Item {index + 1}</span>
                      {item.productName && (
                        <span className="text-sm text-gray-500">
                          - {item.productName} ({item.itemName})
                        </span>
                      )}
                    </div>
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(index);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>

                  {expandedItems.includes(index) && (
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Product Name</label>
                          <select
                            value={item.productName}
                            onChange={(e) => updateItem(index, 'productName', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Product</option>
                            {PRODUCT_OPTIONS.map((product) => (
                              <option key={product} value={product}>
                                {product}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Item Name</label>
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Price</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(index, 'price', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            required
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {initialData ? 'Save Changes' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
