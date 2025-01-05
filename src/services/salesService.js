import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  startAfter,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION_NAME = 'sales';

// Add new sale
export const addSale = async (saleData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...saleData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { id: docRef.id, ...saleData };
  } catch (error) {
    console.error('Error adding sale:', error);
    throw error;
  }
};

// Get paginated sales with optional date filter
export const getPaginatedSales = async (lastDoc = null, itemsPerPage = 8, filterDate = null) => {
  try {
    let queryConstraints = [orderBy('createdAt', 'desc')];

    // Add date filter if provided
    if (filterDate) {
      // Create start and end of the selected date
      const startDate = new Date(filterDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filterDate);
      endDate.setHours(23, 59, 59, 999);

      queryConstraints.push(where('date', '>=', startDate.toISOString().split('T')[0]));
      queryConstraints.push(where('date', '<=', endDate.toISOString().split('T')[0]));
    }

    if (lastDoc) {
      // Get the actual document reference
      const lastDocRef = await getDoc(doc(db, COLLECTION_NAME, lastDoc));
      queryConstraints.push(startAfter(lastDocRef));
    }

    queryConstraints.push(limit(itemsPerPage));

    const q = query(collection(db, COLLECTION_NAME), ...queryConstraints);
    const querySnapshot = await getDocs(q);
    const sales = [];
    let lastVisible = null;

    querySnapshot.forEach((doc) => {
      sales.push({
        id: doc.id,
        ...doc.data(),
      });
      lastVisible = doc.id;
    });

    return {
      sales,
      lastVisible,
      hasMore: querySnapshot.docs.length === itemsPerPage
    };
  } catch (error) {
    console.error('Error getting sales:', error);
    throw error;
  }
};

// Get single sale
export const getSale = async (id) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Sale not found');
    }
  } catch (error) {
    console.error('Error getting sale:', error);
    throw error;
  }
};

// Update sale
export const updateSale = async (id, saleData) => {
  try {
    const saleRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(saleRef, {
      ...saleData,
      updatedAt: Timestamp.now()
    });
    return { id, ...saleData };
  } catch (error) {
    console.error('Error updating sale:', error);
    throw error;
  }
};

// Delete sale
export const deleteSale = async (id) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
    return id;
  } catch (error) {
    console.error('Error deleting sale:', error);
    throw error;
  }
};

// Get total number of sales with optional date filter
export const getTotalSales = async (filterDate = null) => {
  try {
    let q = collection(db, COLLECTION_NAME);

    if (filterDate) {
      // Create start and end of the selected date
      const startDate = new Date(filterDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filterDate);
      endDate.setHours(23, 59, 59, 999);

      q = query(
        q,
        where('date', '>=', startDate.toISOString().split('T')[0]),
        where('date', '<=', endDate.toISOString().split('T')[0])
      );
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting total sales:', error);
    throw error;
  }
};

// Get sales performance data for a specific date
export const getSalesPerformance = async (date) => {
  try {
    // Create start and end of the selected date
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      where('date', '<=', endDate.toISOString().split('T')[0])
    );

    const querySnapshot = await getDocs(q);
    let totalEarnings = 0;
    const productSales = {
      Addison: { quantity: 0, earnings: 0 },
      'Norton Alkon': { quantity: 0, earnings: 0 },
      Bosch: { quantity: 0, earnings: 0 },
      Yuri: { quantity: 0, earnings: 0 },
      'Surie Mirrex': { quantity: 0, earnings: 0 },
      Hikoki: { quantity: 0, earnings: 0 }
    };

    querySnapshot.forEach((doc) => {
      const sale = doc.data();
      sale.items.forEach((item) => {
        const amount = item.quantity * item.price;
        totalEarnings += amount;
        if (productSales[item.productName]) {
          productSales[item.productName].quantity += parseInt(item.quantity);
          productSales[item.productName].earnings += amount;
        }
      });
    });

    return {
      totalEarnings,
      productSales
    };
  } catch (error) {
    console.error('Error getting sales performance:', error);
    throw error;
  }
};

// Get monthly sales performance
export const getMonthlyPerformance = async (date) => {
  try {
    const startDate = new Date(date);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(date);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
    endDate.setHours(23, 59, 59, 999);

    const q = query(
      collection(db, COLLECTION_NAME),
      where('date', '>=', startDate.toISOString().split('T')[0]),
      where('date', '<=', endDate.toISOString().split('T')[0])
    );

    const querySnapshot = await getDocs(q);
    let totalEarnings = 0;

    querySnapshot.forEach((doc) => {
      const sale = doc.data();
      sale.items.forEach((item) => {
        totalEarnings += item.quantity * item.price;
      });
    });

    return totalEarnings;
  } catch (error) {
    console.error('Error getting monthly performance:', error);
    throw error;
  }
};
