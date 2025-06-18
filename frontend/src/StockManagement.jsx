import React, { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, deleteDoc, addDoc, doc } from "firebase/firestore";

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

const StockManagement = () => {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", description: "", stock: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogin = () => {
    if (loginInput === "admin") {
      setIsLoggedIn(true);
    } else {
      // Modern error feedback
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Incorrect password';
      errorDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #ff4444, #ff6b6b);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(255, 68, 68, 0.3);
        z-index: 10000;
        font-family: inherit;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "inventory"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Dedicated refresh function
  const refreshProducts = async () => {
    try {
      setRefreshing(true);
      const querySnapshot = await getDocs(collection(db, "inventory"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      // Success feedback
      const successDiv = document.createElement('div');
      successDiv.textContent = 'Inventory refreshed successfully!';
      successDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(76, 175, 80, 0.3);
        z-index: 10000;
        font-family: inherit;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(successDiv);
      setTimeout(() => successDiv.remove(), 2000);
      
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
      
      // Error feedback
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Failed to refresh inventory';
      errorDiv.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: linear-gradient(135deg, #ff4444, #ff6b6b);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(255, 68, 68, 0.3);
        z-index: 10000;
        font-family: inherit;
        font-weight: 600;
        animation: slideIn 0.3s ease;
      `;
      document.body.appendChild(errorDiv);
      setTimeout(() => errorDiv.remove(), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const startEdit = (prod) => {
    setEditing(prod.id);
    setForm({ name: prod.name, price: prod.price, description: prod.description, stock: prod.stock });
  };

  const saveEdit = async (id) => {
    try {
      await updateDoc(doc(db, "inventory", id), {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        stock: Number(form.stock)
      });
      setEditing(null);
      fetchProducts();
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "inventory", id));
        fetchProducts();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const addProduct = async () => {
    try {
      await addDoc(collection(db, "inventory"), {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        stock: Number(form.stock)
      });
      setForm({ name: "", price: "", description: "", stock: "" });
      fetchProducts();
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchProducts();
  }, [isLoggedIn]);

  // Apple-inspired login screen
  if (!isLoggedIn) {
    return (
      <div className="app-container" style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--apple-white) 0%, #ffffff 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Glassmorphism overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
            pointerEvents: 'none'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            {/* Lock Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, var(--apple-blue) 0%, #0052a3 100%)',
              borderRadius: '50%',
              margin: '0 auto 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: 'white',
              boxShadow: '0 8px 30px rgba(0, 102, 204, 0.3)'
            }}>
              🔒
            </div>
            
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '700',
              marginBottom: '0.5rem',
              color: 'var(--apple-black)',
              letterSpacing: '-0.02em'
            }}>
              Admin Access
            </h2>
            
            <p style={{
              color: 'var(--apple-text-gray)',
              marginBottom: '2rem',
              fontSize: '1rem',
              letterSpacing: '-0.01em'
            }}>
              Enter your password to access stock management
            </p>
            
            <div style={{ marginBottom: '2rem' }}>
              <input
                type="password"
                placeholder="Enter admin password"
                value={loginInput}
                onChange={e => setLoginInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleLogin()}
                style={{
                  width: '100%',
                  padding: '1rem 1.5rem',
                  fontSize: '1.1rem',
                  border: '2px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  letterSpacing: '-0.01em',
                  fontFamily: 'inherit'
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--apple-blue)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 204, 0.1)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <button
              onClick={handleLogin}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--apple-blue) 0%, #0052a3 100%)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                boxShadow: '0 8px 30px rgba(0, 102, 204, 0.3)',
                letterSpacing: '-0.01em',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-2px) scale(1.02)';
                e.target.style.boxShadow = '0 12px 40px rgba(0, 102, 204, 0.4)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 8px 30px rgba(0, 102, 204, 0.3)';
              }}
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--apple-white) 0%, #ffffff 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
    }}>
      {/* ✅ FIXED: Header with emoji fix and refresh button */}
      <div style={{
        background: 'rgba(251, 251, 253, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
        padding: '1.5rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      letterSpacing: '-0.02em', // ✅ FIXED: Less aggressive spacing
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem' // ✅ FIXED: Proper spacing between emoji and text
                    }}>
                      {/* ✅ FIXED: Emoji separate from gradient text */}
                      <span style={{
                        fontSize: '2.5rem',
                        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif'
                      }}>
                        📦
                      </span>
                      
                      {/* ✅ FIXED: Text with gradient effect only */}
                      <span style={{
                        background: 'linear-gradient(135deg, var(--apple-black) 0%, var(--apple-gray) 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        Stock Management
                      </span>
                    </h1>

          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* ✅ NEW: Refresh button */}
            <button
              onClick={refreshProducts}
              disabled={refreshing || loading}
              style={{
                background: refreshing 
                  ? 'linear-gradient(135deg, var(--apple-gray) 0%, var(--apple-black) 100%)'
                  : 'linear-gradient(135deg, var(--apple-blue) 0%, #0052a3 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: (refreshing || loading) ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                opacity: (refreshing || loading) ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={e => {
                if (!refreshing && !loading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 102, 204, 0.4)';
                }
              }}
              onMouseLeave={e => {
                if (!refreshing && !loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <span style={{ 
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
                display: 'inline-block'
              }}>
                🔄
              </span>
              {refreshing ? 'Refreshing...' : 'Refresh Inventory'}
            </button>
            
            <button
              onClick={() => setIsLoggedIn(false)}
              style={{
                background: 'linear-gradient(135deg, var(--apple-gray) 0%, var(--apple-black) 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '3rem 2rem' }}>
        {/* Add Product Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            color: 'var(--apple-black)',
            letterSpacing: '-0.02em'
          }}>
            ➕ Add New Product
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {[
              { key: 'name', placeholder: 'Product Name', icon: '🏷️' },
              { key: 'price', placeholder: 'Price ($)', icon: '💰' },
              { key: 'description', placeholder: 'Description', icon: '📝' },
              { key: 'stock', placeholder: 'Stock Quantity', icon: '📊' }
            ].map(field => (
              <div key={field.key} style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '1rem',
                  zIndex: 2
                }}>
                  {field.icon}
                </span>
                <input
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '1rem 1rem 1rem 3rem',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    background: 'rgba(255, 255, 255, 0.8)',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--apple-blue)';
                    e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 204, 0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            ))}
          </div>
          
          <button
            onClick={addProduct}
            disabled={!form.name || !form.price}
            style={{
              background: 'linear-gradient(135deg, #43a047 0%, #2e7d32 100%)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: (!form.name || !form.price) ? 0.5 : 1
            }}
          >
            ✨ Add Product
          </button>
        </div>

        {/* Products Table */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          <div style={{ padding: '2rem 2rem 1rem' }}>
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: 'var(--apple-black)',
              letterSpacing: '-0.02em',
              margin: 0
            }}>
              📋 Product Inventory ({products.length} items)
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--apple-text-gray)' }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--apple-text-gray)' }}>
              No products found. Add your first product above!
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(0, 102, 204, 0.05)' }}>
                    {['Product Name', 'Price', 'Description', 'Stock', 'Actions'].map(header => (
                      <th key={header} style={{
                        padding: '1rem',
                        textAlign: 'left',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: 'var(--apple-gray)',
                        borderBottom: '2px solid rgba(0, 102, 204, 0.1)'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod, index) => (
                    <tr key={prod.id} style={{
                      background: editing === prod.id ? 'rgba(0, 102, 204, 0.05)' : 
                                 index % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)',
                      transition: 'all 0.3s ease'
                    }}>
                      {['name', 'price', 'description', 'stock'].map(field => (
                        <td key={field} style={{ padding: '1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                          {editing === prod.id ? (
                            <input
                              value={form[field]}
                              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '2px solid var(--apple-blue)',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <span style={{ 
                              color: field === 'price' ? 'var(--apple-blue)' : 'var(--apple-black)',
                              fontWeight: field === 'name' ? '600' : 'normal'
                            }}>
                              {field === 'price' ? `$${prod[field]}` : prod[field]}
                            </span>
                          )}
                        </td>
                      ))}
                      <td style={{ padding: '1rem', borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {editing === prod.id ? (
                            <>
                              <button
                                onClick={() => saveEdit(prod.id)}
                                style={{
                                  background: 'var(--apple-blue)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                ✅ Save
                              </button>
                              <button
                                onClick={() => setEditing(null)}
                                style={{
                                  background: 'var(--apple-text-gray)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                ❌ Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(prod)}
                                style={{
                                  background: 'var(--apple-blue)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(prod.id)}
                                style={{
                                  background: '#e53935',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '8px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* ✅ CSS Animation for refresh button */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default StockManagement;
