function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatPrice(price) {
  const amount = parseFloat(price) || 0;
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount);
}

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  let bgColor = type === 'success' ? 'bg-[#122419] border-wasabi-green/40 text-white' : 'bg-[#2a1215] border-error/40 text-white';
  let icon = type === 'success' ? 'check_circle' : 'error';
  let iconColor = type === 'success' ? 'text-wasabi-green' : 'text-error';

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-sm ${bgColor}`;
  toast.innerHTML = `<span class="material-symbols-outlined ${iconColor} text-xl shrink-0">${icon}</span><span class="font-body-md text-xs sm:text-sm flex-grow">${escapeHTML(message)}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-y-2', 'opacity-0'));
  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Configuración de Firebase con tus llaves
const firebaseConfig = {
  apiKey: "AIzaSyDbZpP9gVLN3ZHlIMV9_1suAOm6ta0lmRU",
  authDomain: "bdmenusukidesu.firebaseapp.com",
  projectId: "bdmenusukidesu",
  storageBucket: "bdmenusukidesu.firebasestorage.app",
  messagingSenderId: "633626125351",
  appId: "1:633626125351:web:fa255734fe854d0c9c5a02"
};

// Inicialización
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const docRef = db.collection("restaurante").doc("menu_actual");

const MenuAPI = {
  async fetchItems(isAdmin = false) {
    const cacheKey = isAdmin ? 'sukidesu_admin_cache' : 'sukidesu_client_cache';
    try {
      if (!isAdmin) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          this.fetchAndCache(cacheKey); 
          return JSON.parse(cached);
        }
      }
      return await this.fetchAndCache(cacheKey);
    } catch (error) {
      showToast("Error de conexión", "error");
      return { items: [], categories: [], config: {} };
    }
  },

  async fetchAndCache(cacheKey) {
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      const result = { items: data.platos || [], categories: data.categorias || [], config: data.config || {} };
      localStorage.setItem(cacheKey, JSON.stringify(result));
      return result;
    }
    return { items: [], categories: [], config: {} };
  },

  async createItem(itemData) {
    try {
      const docSnap = await docRef.get();
      const platos = docSnap.data().platos || [];
      itemData.id = "item_" + new Date().getTime();
      platos.push(itemData);
      await docRef.update({ platos: platos });
      return { status: "success" };
    } catch (error) { return { status: "error", message: error.toString() }; }
  },

  async updateItem(itemData) {
    try {
      const docSnap = await docRef.get();
      let platos = docSnap.data().platos || [];
      const index = platos.findIndex(p => p.id === itemData.id);
      if (index !== -1) {
        platos[index] = itemData;
        await docRef.update({ platos: platos });
        return { status: "success" };
      }
      return { status: "error", message: "Plato no encontrado" };
    } catch (error) { return { status: "error", message: error.toString() }; }
  },

  async deleteItem(id) {
    try {
      const docSnap = await docRef.get();
      let platos = docSnap.data().platos || [];
      platos = platos.filter(p => p.id !== id);
      await docRef.update({ platos: platos });
      return { status: "success" };
    } catch (error) { return { status: "error", message: error.toString() }; }
  },

  async createCategory(catData) {
    try {
      const docSnap = await docRef.get();
      const cats = docSnap.data().categorias || [];
      catData.id = "cat_" + new Date().getTime();
      catData.es_pausada = false;
      cats.push(catData);
      await docRef.update({ categorias: cats });
      return { status: "success" };
    } catch (error) { return { status: "error", message: error.toString() }; }
  },

  async updateCategory(catData) {
    try {
      const docSnap = await docRef.get();
      let cats = docSnap.data().categorias || [];
      const index = cats.findIndex(c => c.id === catData.id);
      if (index !== -1) {
        cats[index].es_pausada = catData.es_pausada;
        await docRef.update({ categorias: cats });
        return { status: "success" };
      }
      return { status: "error" };
    } catch (error) { return { status: "error", message: error.toString() }; }
  },

  async deleteCategory(id) {
    try {
      const docSnap = await docRef.get();
      let cats = docSnap.data().categorias || [];
      cats = cats.filter(c => c.id !== id);
      await docRef.update({ categorias: cats });
      return { status: "success" };
    } catch (error) { return { status: "error", message: error.toString() }; }
  },

  async updateConfig(configData) {
    try {
      await docRef.update({ config: configData });
      return { status: "success" };
    } catch (error) { return { status: "error", message: error.toString() }; }
  },

  async migrarDesdeGoogleSheets() {
    const URL_ANTERIOR = "https://script.google.com/macros/s/AKfycbx5hz4uCKYf-yLkXuhzFTrO5R2cNwTKL8en_hjvhWP-90-SWMdSVXRxShdoHm3AzgkG/exec?admin=true";
    try {
      console.log("Descargando platos desde Google Sheets...");
      const res = await fetch(URL_ANTERIOR);
      const data = await res.json();
      console.log("Subiendo datos a Firebase...");
      await docRef.set({
        config: data.config || {},
        categorias: data.categories || [],
        platos: data.data || []
      });
      console.log("¡Migración completada con éxito!");
      showToast("Migración completa a Firebase", "success");
      setTimeout(() => location.reload(), 2000);
    } catch (e) {
      console.error("Error migrando:", e);
      showToast("Error en la migración", "error");
    }
  }
};