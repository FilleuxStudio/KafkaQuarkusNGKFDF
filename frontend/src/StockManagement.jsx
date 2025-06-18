import React, { useEffect, useState } from "react";
// Import Firestore SDK
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

  // Fonction pour charger les produits
  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchProducts();
  }, [isLoggedIn]);

  // Faux login
  if (!isLoggedIn) {
    return (
      <div style={{padding:40}}>
        <h2>Connexion admin</h2>
        <input placeholder="Mot de passe" type="password" value={loginInput} onChange={e=>setLoginInput(e.target.value)} />
        <button onClick={()=>{
          if(loginInput==="admin") setIsLoggedIn(true);
          else alert("Mot de passe incorrect");
        }}>Se connecter</button>
      </div>
    );
  }

  // Edition d'un produit
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
      alert("Erreur lors de la modification du produit");
    }
  };

  const deleteProduct = async (id) => {
    if(window.confirm("Supprimer ce produit ?")) {
      try {
        await deleteDoc(doc(db, "inventory", id));
        fetchProducts();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression du produit");
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
      alert("Erreur lors de l'ajout du produit");
    }
  };

  return (
    <div style={{padding:40}}>
      <h2 style={{marginBottom:24}}>Gestion du stock</h2>
      <table style={{width:'100%',marginBottom:30, borderCollapse:'collapse', background:'#fff', boxShadow:'0 2px 8px #0001'}}>
        <thead style={{background:'#f5f5f5'}}>
          <tr>
            <th style={{padding:10, border:'1px solid #ddd'}}>Nom</th>
            <th style={{padding:10, border:'1px solid #ddd'}}>Prix</th>
            <th style={{padding:10, border:'1px solid #ddd'}}>Description</th>
            <th style={{padding:10, border:'1px solid #ddd'}}>Stock</th>
            <th style={{padding:10, border:'1px solid #ddd'}}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(prod => (
            <tr key={prod.id} style={{background: editing===prod.id ? '#e3f2fd' : 'inherit'}}>
              <td style={{padding:8, border:'1px solid #ddd'}}>{editing===prod.id ? <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /> : prod.name}</td>
              <td style={{padding:8, border:'1px solid #ddd'}}>{editing===prod.id ? <input value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} /> : prod.price}</td>
              <td style={{padding:8, border:'1px solid #ddd'}}>{editing===prod.id ? <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} /> : prod.description}</td>
              <td style={{padding:8, border:'1px solid #ddd'}}>{editing===prod.id ? <input value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} /> : prod.stock}</td>
              <td style={{padding:8, border:'1px solid #ddd'}}>
                {editing===prod.id ? (
                  <>
                    <button style={{marginRight:8, background:'#1976d2', color:'#fff', border:'none', borderRadius:4, padding:'6px 12px', cursor:'pointer'}} onClick={()=>saveEdit(prod.id)}>Enregistrer</button>
                    <button style={{background:'#eee', color:'#333', border:'none', borderRadius:4, padding:'6px 12px', cursor:'pointer'}} onClick={()=>setEditing(null)}>Annuler</button>
                  </>
                ) : (
                  <>
                    <button style={{marginRight:8, background:'#1976d2', color:'#fff', border:'none', borderRadius:4, padding:'6px 12px', cursor:'pointer'}} onClick={()=>startEdit(prod)}>Modifier</button>
                    <button style={{background:'#e53935', color:'#fff', border:'none', borderRadius:4, padding:'6px 12px', cursor:'pointer'}} onClick={()=>deleteProduct(prod.id)}>Supprimer</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 style={{marginTop:32}}>Ajouter un produit</h3>
      <div style={{display:'flex', gap:8, marginBottom:16}}>
        <input placeholder="Nom" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{padding:8, borderRadius:4, border:'1px solid #ccc'}} />
        <input placeholder="Prix" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={{padding:8, borderRadius:4, border:'1px solid #ccc'}} />
        <input placeholder="Description" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{padding:8, borderRadius:4, border:'1px solid #ccc', minWidth:200}} />
        <input placeholder="Stock" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))} style={{padding:8, borderRadius:4, border:'1px solid #ccc'}} />
        <button style={{background:'#43a047', color:'#fff', border:'none', borderRadius:4, padding:'8px 16px', cursor:'pointer'}} onClick={addProduct}>Ajouter</button>
      </div>
    </div>
  );
};

export default StockManagement; 