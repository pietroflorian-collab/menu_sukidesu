const SukidesuAdmin = {
  adminItems: [], adminCategories: [], adminConfig: {},
  selectedCategory: "", searchQuery: "", customQRLogo: null,

  init() {
    this.bindEvents();
    this.loadAdminData();
    this.enableDragScroll("admin-category-bar");
  },

  bindEvents() {
    const bindClick = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
    bindClick("nav-promo-btn", () => this.openPromoModal());
    bindClick("nav-qr-btn", () => this.openQRModal());
    bindClick("nav-add-btn", () => this.openModal());
    bindClick("nav-cat-btn", () => this.openCategoryModal());
    bindClick("mobile-promo-btn", () => this.openPromoModal());
    bindClick("mobile-qr-btn", () => this.openQRModal());
    bindClick("mobile-new-btn", () => this.openActionModal());
    
    bindClick("close-promo-btn", () => this.closeModalHelper("promoConfigModal"));
    bindClick("close-qr-btn", () => this.closeModalHelper("qrModal"));
    bindClick("close-cat-btn", () => this.closeModalHelper("categoryModal"));
    bindClick("close-item-btn", () => this.closeModalHelper("itemModal"));
    bindClick("cancel-item-btn", () => this.closeModalHelper("itemModal"));
    
    bindClick("promo-save-btn", () => this.savePromoConfig());
    bindClick("qr-download-btn", () => this.downloadAdminQR());
    
    document.getElementById("admin-search-input")?.addEventListener('input', (e) => this.handleSearch(e.target.value));
    document.getElementById("itemForm")?.addEventListener('submit', (e) => this.handleFormSubmit(e));
    document.getElementById("catForm")?.addEventListener('submit', (e) => this.handleCreateCategorySubmit(e));
    
    document.getElementById("qr-input-url")?.addEventListener('input', () => this.renderAdminQR());
    document.getElementById("qr-input-file")?.addEventListener('change', (e) => this.handleQRImageUpload(e));
    document.getElementById("item-link-drive")?.addEventListener('input', () => this.processDriveLink());
    
    ['item-nombre', 'item-precio', 'item-categoria', 'item-descripcion'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.updateModalPreview());
    });

    document.getElementById("admin-category-bar")?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-category]');
      if (btn) this.filterAdminCategory(btn.dataset.category);
    });

    document.getElementById("admin-grid")?.addEventListener('click', (e) => {
      if (e.target.dataset.expandable) e.target.classList.toggle('line-clamp-3');
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'toggle-pause') this.togglePausado(btn.dataset.id);
      if (btn.dataset.action === 'edit') this.editItem(btn.dataset.id);
      if (btn.dataset.action === 'delete') this.deleteItem(btn.dataset.id);
    });

    document.getElementById("category-manage-list")?.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'toggle-cat') this.toggleCategoryPause(btn.dataset.id, btn.dataset.state === 'true');
      if (btn.dataset.action === 'delete-cat') this.deleteCategory(btn.dataset.id);
    });
  },

  enableDragScroll(id) {
    const slider = document.getElementById(id);
    if (!slider) return;
    let isDown = false, startX, scrollLeft;
    slider.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - slider.offsetLeft; scrollLeft = slider.scrollLeft; });
    slider.addEventListener('mouseleave', () => isDown = false);
    slider.addEventListener('mouseup', () => isDown = false);
    slider.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); slider.scrollLeft = scrollLeft - ((e.pageX - slider.offsetLeft) - startX) * 2; });
    slider.addEventListener('wheel', (e) => { if (e.deltaY !== 0) { e.preventDefault(); slider.scrollLeft += e.deltaY; } }, { passive: false });
  },

  async loadAdminData() {
    document.getElementById("admin-loading").classList.remove("hidden");
    document.getElementById("admin-grid").classList.add("hidden");
    const res = await MenuAPI.fetchItems(true);
    this.adminItems = res.items || [];
    this.adminCategories = res.categories || [];
    this.adminConfig = res.config || {};
    document.getElementById("admin-loading").classList.add("hidden");
    document.getElementById("admin-grid").classList.remove("hidden");
    this.populateCategorySelect();
    this.setupAdminCategories();
    this.renderAdminGrid();
  },

  openModalHelper(id) { document.getElementById(id)?.classList.replace("hidden", "flex"); },
  closeModalHelper(id) { document.getElementById(id)?.classList.replace("flex", "hidden"); },

  openPromoModal() {
    document.getElementById("config-promo-activa").checked = String(this.adminConfig.promo_activa).toLowerCase() === "true";
    document.getElementById("config-promo-texto").value = this.adminConfig.promo_texto || "";
    document.getElementById("config-promo-img").value = this.adminConfig.promo_imagen || "";
    this.openModalHelper("promoConfigModal");
  },

  async savePromoConfig() {
    const btn = document.getElementById("promo-save-btn");
    btn.innerText = "Guardando..."; btn.disabled = true;
    const payload = { promo_activa: document.getElementById("config-promo-activa").checked.toString(), promo_texto: document.getElementById("config-promo-texto").value, promo_imagen: document.getElementById("config-promo-img").value };
    const res = await MenuAPI.updateConfig(payload);
    if(res.status === "success") { showToast("Configuración guardada", "success"); this.adminConfig = payload; this.closeModalHelper("promoConfigModal"); }
    btn.innerText = "Guardar"; btn.disabled = false;
  },

  openQRModal() { this.openModalHelper("qrModal"); this.renderAdminQR(); },
  
  handleQRImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => { const img = new Image(); img.onload = () => { this.customQRLogo = img; this.renderAdminQR(); }; img.src = e.target.result; };
      reader.readAsDataURL(file);
    }
  },

  renderAdminQR() {
    const canvas = document.getElementById('admin-qr-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const menuUrl = document.getElementById('qr-input-url').value.trim() || "https://pietroflorian-collab.github.io/menu_sukidesu/";
    canvas.width = 292; canvas.height = 342;
    ctx.fillStyle = '#131313'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(16, 16, 260, 260);
    
    QRCode.toDataURL(menuUrl, { width: 260, margin: 0, errorCorrectionLevel: 'H' }, (err, url) => {
      if (err) return;
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 16, 16);
        ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(146, 146, 36, 0, Math.PI * 2); ctx.fill();
        if (this.customQRLogo) ctx.drawImage(this.customQRLogo, 114, 114, 64, 64);
        ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('MENÚ', 146, 317);
      };
      qrImg.src = url;
    });
  },

  downloadAdminQR() {
    const link = document.createElement('a'); link.download = 'QR_Sukidesu.png';
    link.href = document.getElementById('admin-qr-canvas').toDataURL(); link.click();
  },

  populateCategorySelect() {
    // Conserva las categorías reales para asignar platos, pero borra las combinaciones artificiales.
    const categoriasReales = this.adminCategories.filter(cat => {
      const name = (cat.nombre || "").toLowerCase();
      return name !== "combos y promo" && name !== "combos y promos";
    });
    document.getElementById("item-categoria").innerHTML = categoriasReales.map(cat => 
      `<option value="${escapeHTML(cat.nombre)}" class="bg-surface-container-high text-sushi-white">${escapeHTML(cat.nombre)}</option>`
    ).join("");
  },

  setupAdminCategories() {
    if (this.adminCategories.length === 0) return;
    
    // Limpieza agresiva: Ocultamos de los botones cualquier categoría que contenga las palabras combo o promo
    let categoriasVisibles = this.adminCategories.filter(c => {
        const name = (c.nombre || "").toLowerCase();
        return !name.includes("combo") && !name.includes("promo");
    });
    
    // Inyectamos la categoría fusionada artificialmente de forma única
    categoriasVisibles.push({ nombre: "Combos y Promo", es_pausada: false });

    // Validación de seguridad
    if (!this.selectedCategory || !categoriasVisibles.some(c => c.nombre === this.selectedCategory)) {
      this.selectedCategory = categoriasVisibles[0].nombre;
    }

    document.getElementById("admin-category-bar").innerHTML = categoriasVisibles.map(cat => `
      <button data-category="${escapeHTML(cat.nombre)}" class="w-44 h-11 px-3 py-2 rounded-full font-label-bold text-sm shrink-0 transition-all ${cat.es_pausada ? 'opacity-50 grayscale border-dashed' : ''} ${this.selectedCategory === cat.nombre ? 'bg-primary-container text-sushi-white' : 'bg-surface-container-highest text-tertiary hover:bg-surface-bright'}">${escapeHTML(cat.nombre)} ${cat.es_pausada ? '⏸' : ''}</button>
    `).join("");
  },

  filterAdminCategory(cat) { this.selectedCategory = cat; this.setupAdminCategories(); this.renderAdminGrid(); },
  handleSearch(query) { this.searchQuery = query.toLowerCase().trim(); this.renderAdminGrid(); },

  renderAdminGrid() {
    const grid = document.getElementById("admin-grid");
    const filtered = this.adminItems.filter(i => {
      const safeName = i.nombre || "";
      const matchesSearch = !this.searchQuery || safeName.toLowerCase().includes(this.searchQuery);
      
      let matchesCategory = false;
      
      // Lógica de Fusión: Agrupa todo lo que sea promocional bajo la pestaña unificada
      if (this.selectedCategory === "Combos y Promo") {
        const cat = (i.categoria || "").toLowerCase();
        matchesCategory = (
          cat === "combos" || 
          cat === "promociones" || 
          cat === "promos" || 
          cat === "promo" ||
          (i.texto_promo && i.texto_promo.trim() !== "") || 
          (i.dias_promo && i.dias_promo.trim() !== "")
        );
      } else {
        matchesCategory = this.searchQuery ? true : (i.categoria === this.selectedCategory);
      }
      
      return matchesSearch && matchesCategory;
    });
    
    const itemsHTML = filtered.map(item => UI.generarTarjetaPlato(item, 'admin')).join("");
    const addCardHTML = `<div id="btn-add-grid" class="rounded-xl border-2 border-dashed border-outline-variant/40 hover:border-primary/60 hover:bg-primary/5 transition-colors flex flex-col items-center justify-center min-h-[240px] cursor-pointer group"><div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary-container group-hover:text-white transition-colors"><span class="material-symbols-outlined text-3xl">add</span></div><span class="font-label-bold text-tertiary group-hover:text-primary">Añadir Nuevo</span></div>`;
    
    grid.innerHTML = itemsHTML + addCardHTML;
    document.getElementById("btn-add-grid")?.addEventListener('click', () => this.openModal());
  },

  openActionModal() { this.openModalHelper("actionModal"); },
  openCategoryModal() { this.renderCategoryManageList(); this.openModalHelper("categoryModal"); },

  renderCategoryManageList() {
    document.getElementById("category-manage-list").innerHTML = this.adminCategories.map(cat => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-high border border-outline-variant/30">
        <span class="font-label-bold text-sm ${cat.es_pausada ? 'line-through text-secondary' : 'text-sushi-white'}">${escapeHTML(cat.nombre)}</span>
        <div class="flex gap-2">
          <button data-action="toggle-cat" data-id="${escapeHTML(cat.id)}" data-state="${!cat.es_pausada}" class="px-3 py-1 rounded text-xs font-label-bold ${cat.es_pausada ? 'bg-primary-container text-white' : 'bg-surface-variant text-secondary'}">${cat.es_pausada ? 'Reactivar' : 'Pausar'}</button>
          <button data-action="delete-cat" data-id="${escapeHTML(cat.id)}" class="p-1 text-error hover:bg-error/10 rounded"><span class="material-symbols-outlined pointer-events-none">delete</span></button>
        </div>
      </div>`).join("");
  },

  async handleCreateCategorySubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("add-cat-btn"); btn.disabled = true; btn.innerText = "Creando...";
    const res = await MenuAPI.createCategory({ nombre: document.getElementById("new-cat-name").value.trim() });
    if (res.status === "success") { document.getElementById("new-cat-name").value = ""; showToast("Categoría creada", "success"); await this.loadAdminData(); this.renderCategoryManageList(); }
    btn.disabled = false; btn.innerText = "+ Crear";
  },

  async toggleCategoryPause(id, esPausada) {
    const res = await MenuAPI.updateCategory({ id: id, es_pausada: esPausada });
    if (res.status === "success") { showToast("Estado actualizado", "info"); await this.loadAdminData(); this.renderCategoryManageList(); }
  },

  async deleteCategory(id) {
    if (confirm("¿Eliminar esta categoría?")) {
      const res = await MenuAPI.deleteCategory(id);
      if (res.status === "success") { showToast("Eliminada", "success"); await this.loadAdminData(); this.renderCategoryManageList(); }
    }
  },

  updateModalPreview() {
    document.getElementById("preview-name-text").innerText = document.getElementById("item-nombre").value || "Nombre Plato";
    document.getElementById("preview-cat-text").innerText = document.getElementById("item-categoria").value || "Entradas";
    document.getElementById("preview-desc-text").innerText = document.getElementById("item-descripcion").value || "Descripción...";
    document.getElementById("preview-price-text").innerText = formatPrice(document.getElementById("item-precio").value || 0);
  },

  processDriveLink() {
    const input = document.getElementById("item-link-drive").value.trim();
    const match = input.match(/(?:file\/d\/|id=)([\w-]+)/);
    const finalUrl = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400` : (input.startsWith('http') ? input.replace('sz=w800', 'sz=w400') : "");
    document.getElementById("item-imagen-url").value = finalUrl;
    const previewImg = document.getElementById("image-preview");
    if (finalUrl) { previewImg.src = finalUrl; previewImg.classList.remove("hidden"); document.getElementById("preview-placeholder").classList.add("hidden"); }
    else { previewImg.classList.add("hidden"); document.getElementById("preview-placeholder").classList.remove("hidden"); }
  },

  async togglePausado(id) {
    const item = this.adminItems.find(i => i.id == id);
    if (!item) return;
    item.es_pausado = !(String(item.es_pausado).toLowerCase() === "true");
    const res = await MenuAPI.updateItem(item);
    if (res.status === "success") { showToast("Estado de plato actualizado", "info"); this.renderAdminGrid(); }
  },

  openModal(item = null) {
    document.getElementById("itemForm").reset();
    document.getElementById("item-id").value = item ? item.id : "";
    document.getElementById("modal-title").innerText = item ? "Editar Plato" : "Añadir Nuevo Plato";
    document.querySelectorAll('input[name="promo-dia"]').forEach(cb => cb.checked = false);
    
    if (item) {
      document.getElementById("item-nombre").value = item.nombre || "";
      document.getElementById("item-precio").value = item.precio || 0;
      document.getElementById("item-categoria").value = item.categoria || "";
      document.getElementById("item-imagen-url").value = item.imagen_url || "";
      document.getElementById("item-link-drive").value = item.imagen_url || "";
      document.getElementById("item-descripcion").value = item.descripcion || "";
      document.getElementById("item-picante").checked = String(item.es_picante).toLowerCase() === "true";
      document.getElementById("item-pausado").checked = String(item.es_pausado).toLowerCase() === "true";
      document.getElementById("item-texto-promo").value = item.texto_promo || "";
      if (item.dias_promo) {
        const activeDays = item.dias_promo.split(',').map(d => d.trim());
        document.querySelectorAll('input[name="promo-dia"]').forEach(cb => { if (activeDays.includes(cb.value)) cb.checked = true; });
      }
    }
    this.processDriveLink(); this.updateModalPreview(); this.openModalHelper("itemModal");
  },

  editItem(id) { const item = this.adminItems.find(i => i.id == id); if (item) this.openModal(item); },
  
  async deleteItem(id) { 
    if (confirm("¿Borrar este plato?")) { 
      const res = await MenuAPI.deleteItem(id); 
      if (res.status === "success") { showToast("Borrado", "success"); await this.loadAdminData(); } 
    } 
  },

  async handleFormSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById("submit-btn"); btn.disabled = true; btn.innerText = "Guardando...";
    const payload = {
      id: document.getElementById("item-id").value, nombre: document.getElementById("item-nombre").value,
      precio: document.getElementById("item-precio").value, categoria: document.getElementById("item-categoria").value,
      imagen_url: document.getElementById("item-imagen-url").value, descripcion: document.getElementById("item-descripcion").value,
      es_picante: document.getElementById("item-picante").checked, es_pausado: document.getElementById("item-pausado").checked,
      dias_promo: Array.from(document.querySelectorAll('input[name="promo-dia"]:checked')).map(cb => cb.value).join(','),
      texto_promo: document.getElementById("item-texto-promo").value.trim()
    };
    const res = payload.id ? await MenuAPI.updateItem(payload) : await MenuAPI.createItem(payload);
    btn.disabled = false; btn.innerText = "Guardar Plato";
    if (res.status === "success") { showToast("Guardado con éxito", "success"); this.closeModalHelper("itemModal"); await this.loadAdminData(); }
  }
};
document.addEventListener("DOMContentLoaded", () => SukidesuAdmin.init());