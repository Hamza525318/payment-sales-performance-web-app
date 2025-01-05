'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import PaymentCard from '../components/PaymentCard';
import AddPaymentModal from '../components/AddPaymentModal';
import Pagination from '../components/Pagination';
import { 
  addPayment, 
  getAllPayments, 
  updatePayment, 
  deletePayment, 
  clearAllPayments 
} from '@/services/paymentService';

export default function PaymentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const recordsPerPage = 8;

  // Fetch payments on component mount
  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const fetchedPayments = await getAllPayments();
      setPayments(fetchedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      const newPayment = await addPayment(formData);
      setPayments(prev => [newPayment, ...prev]);
      setShowModal(false);
    } catch (error) {
      console.error('Error adding payment:', error);
      // Show error message to user
    }
  };

  const handleStatusChange = async (id) => {
    try {
      const payment = payments.find(p => p.id === id);
      const newStatus = payment.status === 'pending' ? 'paid' : 'pending';
      await updatePayment(id, { ...payment, status: newStatus });
      setPayments(prev => prev.map(p => 
        p.id === id ? { ...p, status: newStatus } : p
      ));
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleEdit = async (payment) => {
    try {
      const updatedPayment = await updatePayment(payment.id, payment);
      setPayments(prev => prev.map(p => 
        p.id === payment.id ? updatedPayment : p
      ));
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePayment(id);
      setPayments(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  };

  const handleClearAllDues = async () => {
    if (window.confirm('Are you sure you want to clear all dues? This action cannot be undone.')) {
      try {
        await clearAllPayments();
        setPayments([]);
      } catch (error) {
        console.error('Error clearing all dues:', error);
      }
    }
  };

  const totalPages = Math.ceil(payments.length / recordsPerPage);
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = payments.slice(indexOfFirstRecord, indexOfLastRecord);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Navigation */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-between items-center">
        <Link href="/" className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
          <FaArrowLeft className="mr-2" />
          Back to Home
        </Link>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Add Payment Due
        </button>
      </div>

      {/* Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentRecords.map((payment) => (
            <PaymentCard
              key={payment.id}
              payment={payment}
              onStatusChange={handleStatusChange}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {payments.length > 0 ? (
          <>
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />

            {/* Clear All Dues Button */}
            <div className="mt-6">
              <button 
                onClick={handleClearAllDues}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Clear All Dues
              </button>
            </div>
          </>
        ) : (
          <div className="font-bold text-xl text-center vertical-center mt-10 text-gray-500">
            No payments found. Add a new payment to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      <AddPaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
