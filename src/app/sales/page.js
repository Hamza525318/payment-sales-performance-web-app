'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';
import SalesCard from '../components/SalesCard';
import AddSalesModal from '../components/AddSalesModal';
import SalesDetailsModal from '../components/SalesDetailsModal';
import { 
  addSale, 
  getPaginatedSales, 
  updateSale, 
  deleteSale,
  getTotalSales 
} from '@/services/salesService';

export default function SalesPage() {
  const date = new Date();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [editingSale, setEditingSale] = useState(null);
  const [sales, setSales] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const recordsPerPage = 8;

  useEffect(() => {
    fetchSales();
    fetchTotalPages();
  }, [filterDate]); // Refetch when filter changes

  const fetchTotalPages = async () => {
    try {
      const total = await getTotalSales(filterDate || null);
      setTotalPages(Math.ceil(total / recordsPerPage));
    } catch (error) {
      console.error('Error fetching total pages:', error);
    }
  };

  const fetchSales = async (lastDoc = null) => {
    try {
      setLoading(true);
      const result = await getPaginatedSales(lastDoc, recordsPerPage, filterDate || null);
      setSales(result.sales);
      setLastVisible(result.lastVisible);
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < currentPage) {
      // Going backwards - reset to first page
      await fetchSales();
    } else {
      // Going forwards - use last document as cursor
      await fetchSales(lastVisible);
    }
    setCurrentPage(newPage);
  };

  const handleSubmit = async (formData) => {
    try {
      setShowAddModal(false);
      if (editingSale) {
        const updatedSale = await updateSale(editingSale.id, formData);
        setSales(prev => prev.map(s => 
          s.id === editingSale.id ? updatedSale : s
        ));
        setEditingSale(null);
      } else {
        const newSale = await addSale(formData);
        setSales(prev => [newSale, ...prev]);
      }
      await fetchTotalPages(); // Update total pages
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

  const handleEdit = async (sale) => {
    setEditingSale(sale);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingSale(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await deleteSale(id);
        setSales(prev => prev.filter(s => s.id !== id));
        await fetchTotalPages(); // Update total pages
      } catch (error) {
        console.error('Error deleting sale:', error);
      }
    }
  };

  const handleViewDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const handleFilterChange = (date) => {
    setFilterDate(date);
    setCurrentPage(1);
    setLastVisible(null);
  };

  const clearFilter = () => {
    setFilterDate('');
    setCurrentPage(1);
    setLastVisible(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navigation and Filter */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
          <div className="flex md:flex-row items-stretch md:items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {filterDate && (
                <button
                  onClick={clearFilter}
                  className="text-gray-600 hover:text-gray-800 p-2"
                  title="Clear filter"
                >
                  <FaTimes />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add New Sale
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sales.map((sale) => (
            <SalesCard
              key={sale.id}
              sale={sale}
              onViewDetails={handleViewDetails}
              onDelete={() => handleDelete(sale.id)}
              onEdit={() => handleEdit(sale)}
            />
          ))}
        </div>

        {sales.length > 0 ? (
          <div className="mt-6">
            <div className="flex justify-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-l-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="px-4 py-2 border-t border-b text-sm font-medium text-gray-700 bg-white">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || !lastVisible}
                className="px-4 py-2 border rounded-r-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="font-bold text-xl text-center vertical-center mt-10 text-gray-500">
            {filterDate 
              ? `No sales found for ${new Date(filterDate).toLocaleDateString()}`
              : 'No sales found. Add a new sale to get started.'}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddSalesModal
        isOpen={showAddModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={editingSale}
      />
      <SalesDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        sale={selectedSale}
      />
    </div>
  );
}
