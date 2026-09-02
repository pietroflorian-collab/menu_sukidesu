const SukidesuMenu = {
  allItems: [],
  categoriesList: [],
  config: {},
  selectedCategory: "",
  STORAGE_KEY: "sukidesu_order_selection",

  getSelection() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; } catch (e) { return []; }
  },
  saveSelection(list) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    this.updateUI();
  },
  toggleSelection(itemId, itemNombre) {
    let list = this.getSelection();
    const index = list.findIndex(i => i.id === itemId);
    if (index >= 0) list.splice(index, 1);
    else list.push({ id: itemId, nombre: itemNombre, cantidad: 1 });
    this.saveSelection(list);
    this.renderMenu();
  },
  updateQuantity(itemId, delta) {
    let list = this.getSelection();
    const item = list.find(i => i.id === itemId);
    if (item) {
      item.cantidad += delta;
      if (item.cantidad <= 0) list = list.filter(i => i.id !== itemId);
      this.saveSelection(list);
      this.renderMenu();
    }
  },
  clearList() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.updateUI();
    this.renderMenu();
  },
  openModal() { document.getElementById("order-modal").classList.remove("hidden"); },
  closeModal() { document.getElementById("order-modal").classList.add("hidden"); },

  updateUI() {
    const list = this.getSelection();
    const totalCount = list.reduce((acc, curr) => acc + curr.cantidad, 0);
    const fabContainer = document.getElementById("fab-container");
    
    if (totalCount > 0) {
      fabContainer.classList.remove("hidden");
      document.getElementById("fab-badge").innerText = totalCount;
    } else {
      fabContainer.classList.add("hidden");
      this.closeModal();
    }

    const modalList = document.getElementById("modal-item-list");
    if (list.length === 0) {
      modalList.innerHTML = `<div class="text-center py-8"><span class="material-symbols-outlined text-secondary text-4xl mb-2">remove_shopping_cart</span><p class="text-secondary text-sm">No has agregado platos a tu lista.</p></div>`;
    } else {
      modalList.innerHTML = list.map(item => `
        <div class="flex items-center justify-between bg-surface-container-high p-3 rounded-lg border border-outline-variant/20">
          <span class="font-body-md text-sm text-sushi-white truncate max-w-[60%]">${escapeHTML(item.nombre)}</span>
          <div class="flex items-center gap-2 bg-black border border-outline-variant/40 rounded-lg px-2 py-1">
            <button data-action="decrease" data-id="${escapeHTML(item.id)}" class="w-6 h-6 text-primary font-bold hover:bg-surface-variant rounded">-</button>
            <span class="font-price-display text-sm text-sushi-white px-1">${item.cantidad}</span>
            <button data-action="increase" data-id="${escapeHTML(item.id)}" class="w-6 h-6 text-wasabi-green font-bold hover:bg-surface-variant rounded">+</button>
          </div>
        </div>
      `).join("");
    }
  },

  async init() {
    this.bindEvents();
    try {
      const data = await MenuAPI.fetchItems(false);
      this.allItems = data.items || [];
      this.categoriesList = data.categories || [];
      this.config = data.config || {};
    } catch (e) {
      this.allItems = []; this.categoriesList = []; this.config = {};
    }
    document.getElementById("loading-spinner").classList.add("hidden");
    document.getElementById("menu-grid").classList.remove("hidden");
    
    this.setupCategoryFilter();
    this.renderMenu();
    this.updateUI();
  },

  bindEvents() {
    document.getElementById("btn-open-cart").addEventListener('click', () => this.openModal());
    document.getElementById("btn-close-cart").addEventListener('click', () => this.closeModal());
    document.getElementById("btn-clear-cart").addEventListener('click', () => this.clearList());
    document.getElementById("btn-close-cart-bottom").addEventListener('click', () => this.closeModal());

    document.getElementById("category-bar").addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (btn) this.filterCategory(btn.dataset.category);
    });

    document.getElementById("menu-grid").addEventListener('click', (e) => {
      if (e.target.dataset.expandable) e.target.classList.toggle('line-clamp-3');
      const btn = e.target.closest('button[data-action="toggle-select"]');
      if (btn) this.toggleSelection(btn.dataset.id, btn.dataset.name);
    });

    document.getElementById("modal-item-list").addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'decrease') this.updateQuantity(btn.dataset.id, -1);
      if (btn.dataset.action === 'increase') this.updateQuantity(btn.dataset.id, 1);
    });
  },

  setupCategoryFilter() {
    const activeCatNames = this.categoriesList.map(c => c.nombre);
    const categoryBar = document.getElementById("category-bar");
    if (activeCatNames.length === 0) {
      categoryBar.innerHTML = `<p class="text-secondary text-sm">No hay categorías disponibles.</p>`;
      return;
    }
    if (!this.selectedCategory || !activeCatNames.includes(this.selectedCategory)) this.selectedCategory = activeCatNames[0];
    
    categoryBar.innerHTML = activeCatNames.map(cat => `
      <button data-category="${escapeHTML(cat)}" class="w-[145px] h-10 px-2 py-1 rounded-full font-label-bold text-xs sm:text-sm text-center flex items-center justify-center shrink-0 transition-all ${this.selectedCategory === cat ? 'bg-primary-container text-sushi-white font-bold shadow-md' : 'bg-surface-variant text-tertiary hover:bg-surface-bright border border-outline-variant/20'}">${escapeHTML(cat)}</button>
    `).join("");
    document.getElementById("current-category-title").innerHTML = `<span class="material-symbols-outlined mr-2 text-primary">restaurant_menu</span> ${escapeHTML(this.selectedCategory)}`;
  },

  filterCategory(cat) {
    this.selectedCategory = cat;
    this.setupCategoryFilter();
    this.renderMenu();
  },

  renderMenu() {
    const grid = document.getElementById("menu-grid");
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    
    const filtered = this.allItems.filter(i => {
      // Filtro inteligente para el cliente: solo promos de hoy
      if (this.selectedCategory === "Combos y Promos") {
        const activeDays = i.dias_promo ? i.dias_promo.split(',').map(d => d.trim().toLowerCase()) : [];
        return activeDays.includes(today) && i.texto_promo;
      }
      return i.categoria === this.selectedCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-full text-center py-12 bg-[#181818] rounded-xl border border-dashed border-outline-variant/30 my-4"><span class="material-symbols-outlined text-secondary text-5xl mb-3">ramen_dining</span><h3 class="text-secondary">No hay platos disponibles</h3></div>`;
      return;
    }
    grid.innerHTML = filtered.map(item => UI.generarTarjetaPlato(item, 'client', this.getSelection())).join("");
  }
};
document.addEventListener("DOMContentLoaded", () => SukidesuMenu.init());