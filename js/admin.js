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
    bindClick("mobile-new-btn", () => this.openModal()); // <-- Conectado al modal correcto
    
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
    document.getElementById("qr-input-texto")?.addEventListener('input', () => this.renderAdminQR());
    document.getElementById("item-link-drive")?.addEventListener('input', () => this.processDriveLink());
    
    // Escucha el nuevo campo item-promo-texto para la vista previa
    ['item-nombre', 'item-precio', 'item-categoria', 'item-descripcion', 'item-promo-texto'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.updateModalPreview());
    });
    document.getElementById('item-picante')?.addEventListener('change', () => this.updateModalPreview());

    ['config-promo-texto', 'config-promo-img'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => this.updatePromoPreview());
    });
    document.getElementById('config-promo-activa')?.addEventListener('change', () => this.updatePromoPreview());

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
    this.updatePromoPreview();
    this.openModalHelper("promoConfigModal");
  },

  updatePromoPreview() {
    const texto = document.getElementById("config-promo-texto").value || "Tu texto aparecerá aquí...";
    const url = document.getElementById("config-promo-img").value.trim();
    document.getElementById("admin-preview-promo-texto").innerText = texto;
    const imgEl = document.getElementById("admin-preview-promo-img");
    if (url) { imgEl.src = url; imgEl.classList.remove("hidden"); } 
    else { imgEl.src = ""; imgEl.classList.add("hidden"); }
  },

  async savePromoConfig() {
    const btn = document.getElementById("promo-save-btn");
    btn.innerText = "Guardando..."; btn.disabled = true;
    const payload = { promo_activa: document.getElementById("config-promo-activa").checked.toString(), promo_texto: document.getElementById("config-promo-texto").value, promo_imagen: document.getElementById("config-promo-img").value };
    const res = await MenuAPI.updateConfig(payload);
    if(res.status === "success") { showToast("Configuración guardada", "success"); this.adminConfig = payload; this.closeModalHelper("promoConfigModal"); }
    btn.innerText = "Guardar Anuncio"; btn.disabled = false;
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
    
    let baseUrl = document.getElementById('qr-input-url').value.trim() || "https://pietroflorian-collab.github.io/menu_sukidesu/";
    if(baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1); // Limpiar barra final
    
    // Capturar el texto de la mesa
    const textoQR = document.getElementById('qr-input-texto')?.value.trim() || 'MENÚ';
    
    // --- LÓGICA DE AFILIADO / RASTREO ---
    const hoy = new Date();
    const dia = hoy.getDate();
    const anio = hoy.getFullYear();
    const tokenSecreto = dia + (anio * 76); // Tu fórmula matemática
    
    // Crear el enlace envenenado con los datos de rastreo
    // Ejemplo: https://.../menu_sukidesu/?mesa=Mesa_1&tk=153980
    const urlRastreo = `${baseUrl}/?mesa=${encodeURIComponent(textoQR.replace(/\s+/g, '_'))}&tk=${tokenSecreto}`;

    canvas.width = 292; canvas.height = 342;
    ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0, 0, canvas.width, canvas.height); 
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(16, 16, 260, 260);
    
    QRCode.toDataURL(urlRastreo, { // Inyectamos la URL con rastreo al código
      width: 260, margin: 0, errorCorrectionLevel: 'H',
      color: { dark: '#000000', light: '#FFFFFF' }
    }, (err, url) => {
      if (err) return;
      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 16, 16);
        ctx.fillStyle = '#FFFFFF'; ctx.fillRect(106, 106, 80, 80); 
        if (this.customQRLogo) ctx.drawImage(this.customQRLogo, 114, 114, 64, 64);
        
        // Escribir el texto de la mesa en el diseño final
        ctx.fillStyle = '#FFFFFF'; 
        ctx.font = 'bold 26px sans-serif'; 
        ctx.textAlign = 'center'; 
        ctx.fillText(textoQR.toUpperCase(), 146, 317);
      };
      qrImg.src = url;
    });
  },

  downloadAdminQR() {
    // Generar nombre de archivo dinámico
    const textoQR = document.getElementById('qr-input-texto')?.value.trim() || 'QR';
    const nombreLimpio = textoQR.replace(/\s+/g, '_'); // Mesa 1 -> Mesa_1
    
    const link = document.createElement('a'); 
    link.download = `QR_${nombreLimpio}.png`; // Se descargará como QR_Mesa_1.png
    link.href = document.getElementById('admin-qr-canvas').toDataURL(); 
    link.click();
  },

  populateCategorySelect() {
    const categoriasReales = this.adminCategories.filter(cat => {
      const name = (cat.nombre || "").toLowerCase();
      return name !== "combos y promo" && name !== "combos y promos";
    });
    document.getElementById("item-categoria").innerHTML = categoriasReales.map(cat => 
      `<option value="${escapeHTML(cat.nombre)}" class="bg-surface-container-high text-on-surface">${escapeHTML(cat.nombre)}</option>`
    ).join("");
  },

  setupAdminCategories() {
    if (this.adminCategories.length === 0) return;
    let categoriasVisibles = this.adminCategories.filter(c => {
        const name = (c.nombre || "").toLowerCase();
        return !name.includes("combo") && !name.includes("promo");
    });
    categoriasVisibles.push({ nombre: "Combos y Promo", es_pausada: false });

    if (!this.selectedCategory || !categoriasVisibles.some(c => c.nombre === this.selectedCategory)) {
      this.selectedCategory = categoriasVisibles[0].nombre;
    }

    document.getElementById("admin-category-bar").innerHTML = categoriasVisibles.map(cat => `
      <button data-category="${escapeHTML(cat.nombre)}" class="w-44 h-11 px-3 py-2 rounded-full font-label-bold text-sm shrink-0 transition-all ${cat.es_pausada ? 'opacity-50 grayscale border-dashed' : ''} ${this.selectedCategory === cat.nombre ? 'bg-primary text-sushi-white' : 'bg-surface-container-highest text-tertiary hover:bg-surface-bright'}">${escapeHTML(cat.nombre)} ${cat.es_pausada ? '⏸' : ''}</button>
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
      
      if (this.selectedCategory === "Combos y Promo") {
        const cat = (i.categoria || "").toLowerCase();
        matchesCategory = (
          cat === "combos" || cat === "promociones" || cat === "promos" || cat === "promo" ||
          (i.dias_promo && i.dias_promo.trim() !== "")
        );
      } else {
        matchesCategory = this.searchQuery ? true : (i.categoria === this.selectedCategory);
      }
      return matchesSearch && matchesCategory;
    });
    
    const itemsHTML = filtered.map(item => UI.generarTarjetaPlato(item, 'admin')).join("");
    const addCardHTML = `<div id="btn-add-grid" class="rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center min-h-[240px] cursor-pointer group"><div class="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors"><span class="material-symbols-outlined text-3xl">add</span></div><span class="font-label-bold text-tertiary group-hover:text-primary">Añadir Nuevo</span></div>`;
    
    grid.innerHTML = itemsHTML + addCardHTML;
    document.getElementById("btn-add-grid")?.addEventListener('click', () => this.openModal());
  },

  openActionModal() { this.openModalHelper("actionModal"); },
  openCategoryModal() { this.renderCategoryManageList(); this.openModalHelper("categoryModal"); },

  renderCategoryManageList() {
    document.getElementById("category-manage-list").innerHTML = this.adminCategories.map(cat => `
      <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-high border border-outline-variant/30">
        <span class="font-label-bold text-sm ${cat.es_pausada ? 'line-through text-secondary' : 'text-on-surface'}">${escapeHTML(cat.nombre)}</span>
        <div class="flex gap-2">
          <button data-action="toggle-cat" data-id="${escapeHTML(cat.id)}" data-state="${!cat.es_pausada}" class="px-3 py-1 rounded text-xs font-label-bold ${cat.es_pausada ? 'bg-primary text-sushi-white' : 'bg-surface-variant text-secondary'}">${cat.es_pausada ? 'Reactivar' : 'Pausar'}</button>
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
    // 1. Recopilar datos en vivo del formulario comprimido
    const itemEnVivo = {
      nombre: document.getElementById("item-nombre").value || "Nombre del Plato",
      categoria: document.getElementById("item-categoria").value || "Categoría",
      descripcion: document.getElementById("item-descripcion").value || "Descripción del plato...",
      precio: document.getElementById("item-precio").value || 0,
      imagen_url: document.getElementById("item-imagen-url").value || "",
      es_picante: document.getElementById("item-picante").checked,
      es_pausado: document.getElementById("item-pausado").checked,
      texto_promo: document.getElementById("item-promo-texto").value.trim()
    };

    // 2. Pedirle a UI.js el diseño exacto del cliente y meterlo en el lado derecho
    const contenedor = document.getElementById("preview-container");
    if (contenedor) {
      contenedor.innerHTML = UI.generarTarjetaPlato(itemEnVivo, 'preview');
    }
  },

  processDriveLink() {
    const input = document.getElementById("item-link-drive").value.trim();
    const match = input.match(/(?:file\/d\/|id=)([\w-]+)/);
    const finalUrl = match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w400` : (input.startsWith('http') ? input.replace('sz=w800', 'sz=w400') : "");
    
    // Solo guarda la URL procesada en el input oculto. 
    // updateModalPreview() se encargará de dibujar la foto en la tarjeta.
    document.getElementById("item-imagen-url").value = finalUrl;
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
      document.getElementById("item-promo-texto").value = item.texto_promo || ""; 

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
      texto_promo: document.getElementById("item-promo-texto").value.trim(),
      dias_promo: Array.from(document.querySelectorAll('input[name="promo-dia"]:checked')).map(cb => cb.value).join(',')
    };
    const res = payload.id ? await MenuAPI.updateItem(payload) : await MenuAPI.createItem(payload);
    btn.disabled = false; btn.innerText = "Guardar Plato";
    if (res.status === "success") { showToast("Guardado con éxito", "success"); this.closeModalHelper("itemModal"); await this.loadAdminData(); }
  }
};
document.addEventListener("DOMContentLoaded", () => SukidesuAdmin.init());