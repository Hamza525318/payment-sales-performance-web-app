import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  query,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'payments';

// Add new payment
export const addPayment = async (paymentData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...paymentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...paymentData };
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
};

// Get all payments
export const getAllPayments = async () => {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting payments:', error);
    throw error;
  }
};

// Update payment
export const updatePayment = async (id, paymentData) => {
  try {
    const paymentRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(paymentRef, {
      ...paymentData,
      updatedAt: Timestamp.now()
    });
    return { id, ...paymentData };
  } catch (error) {
    console.error('Error updating payment:', error);
    throw error;
  }
};

// Delete payment
export const deletePayment = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error('Error deleting payment:', error);
    throw error;
  }
};

// Clear all payments
export const clearAllPayments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error clearing all payments:', error);
    throw error;
  }
};
