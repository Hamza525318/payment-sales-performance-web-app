// services/purchaseService.js
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, Timestamp, limit, startAfter, where, getCountFromServer } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';

const COLLECTION_NAME = 'purchases';

export const addPurchase = async (purchaseData, invoiceFile) => {
  try {
    let imageUrl = '';
    if (invoiceFile) {
      try {
        imageUrl = await uploadToCloudinary(invoiceFile);
      } catch (error) {
        alert('Error uploading invoice: ' + error.message);
        throw error;
      }
    }

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...purchaseData,
      invoiceImgUrl: imageUrl,
      createdAt: Timestamp.now()
    });

    return {
      id: docRef.id,
      ...purchaseData,
      invoiceImgUrl: imageUrl,
    };
  } catch (error) {
    console.error('Error adding purchase:', error);
    throw error;
  }
};

export const getPaginatedPurchases = async (lastDoc = null, recordsPerPage = 8, partyName = null) => {
  try {
    let q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc'),
      limit(recordsPerPage)
    );

    if (partyName) {
      q = query(
        collection(db, COLLECTION_NAME),
        where('partyName', '==', partyName),
        orderBy('createdAt', 'desc'),
        limit(recordsPerPage)
      );
    }

    if (lastDoc) {
      q = query(
        collection(db, COLLECTION_NAME),
        partyName ? where('partyName', '==', partyName) : null,
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(recordsPerPage)
      );
    }

    const querySnapshot = await getDocs(q);
    const purchases = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString()
    }));

    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];

    return {
      purchases,
      lastVisible
    };
  } catch (error) {
    console.error('Error getting purchases:', error);
    throw error;
  }
};

export const getTotalPurchases = async (partyName = null) => {
  try {
    let q = collection(db, COLLECTION_NAME);
    
    if (partyName) {
      q = query(collection(db, COLLECTION_NAME), where('partyName', '==', partyName));
    }

    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error getting total purchases:', error);
    throw error;
  }
};

export const updatePurchase = async (purchaseId, purchaseData, invoiceFile,editingPurchase) => {
  try {
    let imageUrl = editingPurchase?.invoiceImgUrl;
    // console.log('invoiceFile:', invoiceFile);
    // console.log('imageUrl:', purchaseData.invoiceImgUrl);
    if (invoiceFile) {
      try {
        imageUrl = await uploadToCloudinary(invoiceFile);
      } catch (error) {
        alert('Error uploading invoice: ' + error.message);
        throw error;
      }
    }

    const purchaseRef = doc(db, COLLECTION_NAME, purchaseId);
    const updatedData = {
      ...purchaseData,
      invoiceImgUrl: imageUrl,
      updatedAt: Timestamp.now()
    };

    await updateDoc(purchaseRef, updatedData);
    return {
      id: purchaseId,
      ...updatedData
    };
  } catch (error) {
    console.error('Error updating purchase:', error);
    throw error;
  }
};

export const deletePurchase = async (purchaseId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, purchaseId));
  } catch (error) {
    console.error('Error deleting purchase:', error);
    throw error;
  }
};