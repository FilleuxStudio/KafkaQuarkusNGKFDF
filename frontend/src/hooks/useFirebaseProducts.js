import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { products as fallbackProducts } from '../products';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const useFirebaseProducts = () => {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('hardcoded');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching products from Firebase inventory...');
      
      const querySnapshot = await getDocs(collection(db, "inventory"));
      const firebaseProducts = [];
      
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        
        const product = {
          id: doc.id,
          name: data.name || doc.id,
          price: data.price || 0,
          image: data.image || `https://via.placeholder.com/400x400/f5f5f7/1d1d1f?text=${encodeURIComponent(data.name || 'Product')}`,
          stock: data.stock || 0,
          description: data.description || ""
        };
        
        firebaseProducts.push(product);
      });

      if (firebaseProducts.length > 0) {
        console.log(`✅ Loaded ${firebaseProducts.length} products from Firebase`);
        setProducts(firebaseProducts);
        setDataSource('firebase');
      } else {
        console.log('⚠️ No products found in Firebase, using hardcoded fallback');
        setProducts(fallbackProducts);
        setDataSource('hardcoded');
      }
      
    } catch (err) {
      console.error('❌ Error fetching Firebase products:', err);
      setProducts(fallbackProducts);
      setDataSource('hardcoded');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    dataSource,
    refetch: fetchProducts
  };
};
