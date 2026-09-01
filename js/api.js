const API_URL = "https://script.google.com/macros/s/AKfycbxeY51PE3g2okiQzmSU5ZyQ24XXRLRkX_5noevGtOBmZZIjxI0KydkoJh8aibeKVPQ/exec";

function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
  
  let bgColor = 'bg-[#181818] border-outline-variant/40 text-sushi-white';
  let icon = 'info';
  let iconColor = 'text-primary';

  if (type === 'success') {
    bgColor = 'bg-[#122419] border-wasabi-green/40 text-sushi-white';
    icon = 'check_circle';
    iconColor = 'text-wasabi-green';
  } else if (type === 'error') {
    bgColor = 'bg-[#2a1215] border-error/40 text-sushi-white';
    icon = 'error';
    iconColor = 'text-error';
  } else if (type === 'warning') {
    bgColor = 'bg-[#2a2212] border-yellow-500/40 text-sushi-white';
    icon = 'warning';
    iconColor = 'text-yellow-500';
  }

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-sm ${bgColor}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} text-xl shrink-0">${icon}</span>
    <span class="font-body-md text-xs sm:text-sm flex-grow">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => { toast.remove(); }, 300);
  }, 3500);
}

const MenuAPI = {
  async fetchItems(isAdmin = false) {
    try {
      const url = isAdmin ? `${API_URL}?admin=true` : API_URL;
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "success") {
        return {
          items: result.data || [],
          categories: result.categories || [],
          config: result.config || {}
        };
      }
      return { items: [], categories: [], config: {} };
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      showToast("Error de conexión al cargar datos", "error");
      return { items: [], categories: [], config: {} };
    }
  },

  async createItem(itemData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "create", data: itemData })
      });
      return await response.json();
    } catch (error) {
      return { status: "error", message: error.toString() };
    }
  },

  async updateItem(itemData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "update", data: itemData })
      });
      return await response.json();
    } catch (error) {
      return { status: "error", message: error.toString() };
    }
  },

  async deleteItem(id) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "delete", data: { id: id } })
      });
      return await response.json();
    } catch (error) {
      return { status: "error", message: error.toString() };
    }
  },

  async createCategory(catData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "create_category", data: catData })
      });
      return await response.json();
    } catch (error) {
      return { status: "error", message: error.toString() };
    }
  },

  async updateCategory(catData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "update_category", data: catData })
      });
      return await response.json();
    } catch (error) {
      return { status: "error", message: error.toString() };
    }
  },

  async deleteCategory(id) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "delete_category", data: { id: id } })
      });
      return await response.json();
    } catch (error) {
      return { status: "error", message: error.toString() };
    }
  },

  async updateConfig(configData) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "update_config", data: configData })
      });
      return await response.json();
    } catch (error) {
      return { status: "error", message: error.toString() };
    }
  }
};

function formatPrice(price) {
  const amount = parseFloat(price) || 0;
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount);
}