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
    
    if (totalCount > 0 && fabContainer) {
      fabContainer.classList.remove("hidden");
      document.getElementById("fab-badge").innerText = totalCount;
    } else if (fabContainer) {
      fabContainer.classList.add("hidden");
      this.closeModal();
    }

    const modalList = document.getElementById("modal-item-list");
    if (!modalList) return;
    
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
      // FORZAMOS LA LECTURA EN VIVO PASANDO "true" TEMPORALMENTE
      // Esto engaña a la API para que obvie el caché del cliente en la carga inicial y baje el config fresco.
      const data = await MenuAPI.fetchItems(true); 
      this.allItems = data.items || [];
      this.categoriesList = data.categories || [];
      this.config = data.config || {};
      
      // Actualizamos manualmente el caché del cliente con los datos frescos
      localStorage.setItem('sukidesu_client_cache', JSON.stringify(data));
      
    } catch (e) {
      this.allItems = []; this.categoriesList = []; this.config = {};
    }
    document.getElementById("loading-spinner")?.classList.add("hidden");
    document.getElementById("menu-grid")?.classList.remove("hidden");
    
    this.setupCategoryFilter();
    this.renderMenu();
    this.updateUI();

    // 🚀 Aquí disparamos el pop-up frontal de publicidad con los datos 100% frescos
    this.mostrarPromoFrontal(this.config);
  },

  bindEvents() {
    const bindClick = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
    bindClick("btn-open-cart", () => this.openModal());
    bindClick("btn-close-cart", () => this.closeModal());
    bindClick("btn-clear-cart", () => this.clearList());
    bindClick("btn-close-cart-bottom", () => this.closeModal());

    document.getElementById("category-bar")?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (btn) this.filterCategory(btn.dataset.category);
    });

    document.getElementById("menu-grid")?.addEventListener('click', (e) => {
      if (e.target.dataset.expandable) e.target.classList.toggle('line-clamp-3');
      const btn = e.target.closest('button[data-action="toggle-select"]');
      if (btn) this.toggleSelection(btn.dataset.id, btn.dataset.name);
    });

    document.getElementById("modal-item-list")?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'decrease') this.updateQuantity(btn.dataset.id, -1);
      if (btn.dataset.action === 'increase') this.updateQuantity(btn.dataset.id, 1);
    });
  },

  setupCategoryFilter() {
    if (this.categoriesList.length === 0) {
      document.getElementById("category-bar").innerHTML = `<p class="text-secondary text-sm">No hay categorías disponibles.</p>`;
      return;
    }

    let categoriasVisibles = this.categoriesList
      .filter(c => {
        const name = (c.nombre || "").toLowerCase();
        return !name.includes("combo") && !name.includes("promo");
      })
      .map(c => c.nombre);
    
    categoriasVisibles.push("Combos y Promo");

    if (!this.selectedCategory || !categoriasVisibles.includes(this.selectedCategory)) {
      this.selectedCategory = categoriasVisibles[0];
    }
    
    const categoryBar = document.getElementById("category-bar");
    categoryBar.innerHTML = categoriasVisibles.map(cat => `
      <button data-category="${escapeHTML(cat)}" class="w-[145px] h-10 px-2 py-1 rounded-full font-label-bold text-xs sm:text-sm text-center flex items-center justify-center shrink-0 transition-all ${this.selectedCategory === cat ? 'bg-primary-container text-sushi-white font-bold shadow-md' : 'bg-surface-container-highest text-tertiary hover:bg-surface-bright border border-outline-variant/20'}">${escapeHTML(cat)}</button>
    `).join("");
    
    const titleEl = document.getElementById("current-category-title");
    if (titleEl) titleEl.innerHTML = `<span class="material-symbols-outlined mr-2 text-primary">restaurant_menu</span> ${escapeHTML(this.selectedCategory)}`;
  },

  filterCategory(cat) {
    this.selectedCategory = cat;
    this.setupCategoryFilter();
    this.renderMenu();
  },

  renderMenu() {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    
    const filtered = this.allItems.filter(i => {
      if (this.selectedCategory === "Combos y Promo") {
        const cat = (i.categoria || "").toLowerCase();
        // Solo verificamos si el día de hoy está tildado en la base de datos
        const activeDays = i.dias_promo ? i.dias_promo.split(',').map(d => d.trim().toLowerCase()) : [];
        const isPromoToday = activeDays.includes(today);
        
        return (cat === "combos" || cat === "promociones" || cat === "promos" || cat === "promo" || isPromoToday);
      }
      return i.categoria === this.selectedCategory;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12 bg-surface-container rounded-xl border border-dashed border-outline-variant/30 my-4">
          <span class="material-symbols-outlined text-secondary text-5xl mb-3">ramen_dining</span>
          <h3 class="font-headline-lg-mobile text-lg text-secondary">No hay platos disponibles</h3>
          <p class="font-body-md text-xs text-secondary/70 mt-1">Pronto añadiremos nuevas opciones.</p>
        </div>`;
      return;
    }
    grid.innerHTML = filtered.map(item => UI.generarTarjetaPlato(item, 'client', this.getSelection())).join("");
  },

  mostrarPromoFrontal(config) {
    if (!config) return;
    
    const isActiva = String(config.promo_activa).toLowerCase() === "true";
    const texto = config.promo_texto || "";
    const imagenUrl = config.promo_imagen || "";

    // Si está inactivo o no hay texto, garantizamos que no se ejecute nada
    if (!isActiva || texto.trim() === "") return;

    const modal = document.getElementById("clientePromoModal");
    const modalContent = document.getElementById("clientePromoContent");
    if(!modal || !modalContent) return;
    
    document.getElementById("cliente-promo-texto").innerText = texto;
    const imgElement = document.getElementById("cliente-promo-img");
    
    // Eliminamos la referencia al placeholder ya que tú no lo tienes en el index.html
    if (imagenUrl) {
      imgElement.src = imagenUrl;
      imgElement.classList.remove("hidden");
    } else {
      imgElement.classList.add("hidden");
    }

    modal.classList.replace("hidden", "flex");
    setTimeout(() => {
      modal.classList.remove("opacity-0");
      modalContent.classList.remove("scale-95");
    }, 50);

    const cerrarPromo = () => {
      modal.classList.add("opacity-0");
      modalContent.classList.add("scale-95");
      setTimeout(() => modal.classList.replace("flex", "hidden"), 300);
    };

    document.getElementById("close-cliente-promo").onclick = cerrarPromo;
    document.getElementById("btn-entendido-promo").onclick = cerrarPromo;
  }
};

document.addEventListener("DOMContentLoaded", () => SukidesuMenu.init());