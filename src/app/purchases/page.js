'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlus, FaFilter, FaTimes } from 'react-icons/fa';
import PurchaseCard from '../components/PurchaseCard';
import AddPurchaseModal from '../components/AddPurchaseModal';
import LoadingModal from '../components/LoadingModal';
import { getPaginatedPurchases, addPurchase, updatePurchase, deletePurchase, getTotalPurchases } from '@/services/purchaseService';
import { toast } from 'react-hot-toast';

export default function PurchasesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [selectedParty, setSelectedParty] = useState('');
  const [showPartyFilter, setShowPartyFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [lastVisible, setLastVisible] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const recordsPerPage = 8;

  useEffect(() => {
    fetchPurchases();
    fetchTotalPages();
  }, [selectedParty]);

  const fetchTotalPages = async () => {
    try {
      const total = await getTotalPurchases(selectedParty || null);
      setTotalPages(Math.ceil(total / recordsPerPage));
    } catch (error) {
      console.error('Error fetching total pages:', error);
      toast.error('Failed to load total pages');
    }
  };

  const fetchPurchases = async (lastDoc = null) => {
    try {
      setLoading(true);
      const result = await getPaginatedPurchases(lastDoc, recordsPerPage, selectedParty || null);
      setPurchases(result.purchases);
      setLastVisible(result.lastVisible);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast.error('Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    if (newPage < currentPage) {
      // Going backwards - reset to first page
      await fetchPurchases();
    } else {
      // Going forwards - use last document as cursor
      await fetchPurchases(lastVisible);
    }
    setCurrentPage(newPage);
  };

  const handleSubmit = async (formData, invoiceFile) => {
    try {
      setShowAddModal(false);
      setIsUploading(true);
      
      if (editingPurchase) {
        const updatedPurchase = await updatePurchase(editingPurchase.id, formData,invoiceFile,editingPurchase);
        setPurchases(prev => prev.map(p => 
          p.id === editingPurchase.id ? updatedPurchase : p
        ));
        setEditingPurchase(null);
        toast.success('Purchase updated successfully');
      } else {
        const newPurchase = await addPurchase(formData, invoiceFile);
        setPurchases(prev => [newPurchase, ...prev]);
        toast.success('Purchase added successfully');
      }
      await fetchTotalPages(); // Update total pages after adding/updating
    } catch (error) {
      console.error('Error saving purchase:', error);
      toast.error('Failed to save purchase');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setShowAddModal(true);
  };

  const handleDelete = async (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this purchase?')) {
      try {
        const toastId = toast.loading('Deleting purchase...');
        await deletePurchase(purchaseId);
        setPurchases(prev => prev.filter(p => p.id !== purchaseId));
        await fetchTotalPages(); // Update total pages after deletion
        toast.success('Purchase deleted successfully', { id: toastId });
      } catch (error) {
        console.error('Error deleting purchase:', error);
        toast.error('Failed to delete purchase');
      }
    }
  };

  const PartyFilter = () => (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPartyFilter(!showPartyFilter)}
          className="flex items-center bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaFilter className="mr-2" />
          {selectedParty || 'Filter by Party'}
        </button>
        {selectedParty && (
          <button
            onClick={() => {
              setSelectedParty('');
              setCurrentPage(1);
              setLastVisible(null);
            }}
            className="text-gray-600 hover:text-gray-800 p-2"
            title="Clear filter"
          >
            <FaTimes />
          </button>
        )}
      </div>
      
      {showPartyFilter && (
        <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="py-1">
            <button
              onClick={() => {
                setSelectedParty('');
                setShowPartyFilter(false);
                setCurrentPage(1);
                setLastVisible(null);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700"
            >
              Show All
            </button>
            {Array.from(new Set(purchases.map(p => p.partyName))).sort().map(party => (
              <button
                key={party}
                onClick={() => {
                  setSelectedParty(party);
                  setShowPartyFilter(false);
                  setCurrentPage(1);
                  setLastVisible(null);
                }}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700"
              >
                {party}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-2 mb-6 md:justify-between md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <PartyFilter />
            <button
              onClick={() => {
                setEditingPurchase(null);
                setShowAddModal(true);
              }}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Purchase
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchases.length > 0 ? (
            purchases.map(purchase => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-600">
                {selectedParty 
                  ? `No purchases found for ${selectedParty}. Try selecting a different party or clear the filter.`
                  : 'No purchases found. Add a new purchase to get started.'}
              </p>
            </div>
          )}
        </div>

        {purchases.length > 0 && (
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
        )}
      </div>

      <AddPurchaseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingPurchase(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingPurchase}
      />

      <LoadingModal
        isOpen={isUploading}
        message="Uploading purchase details and invoice..."
      />
    </div>
  );
}