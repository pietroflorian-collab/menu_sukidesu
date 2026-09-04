const UI = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    // 1. VARIABLES BASE
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const rawUrl = item.imagen_url || '';
    const optimizedImgUrl = rawUrl.replace('sz=w800', 'sz=w400');
    const isPicante = String(item.es_picante).toLowerCase() === "true";
    const hasPromoText = item.texto_promo && item.texto_promo.trim() !== "";
    const itemId = item.id || item.nombre;
    const precioFormatted = typeof formatPrice === 'function' ? formatPrice(item.precio) : `$${item.precio}`;
    
    // 2. COMPONENTES VISUALES COMPARTIDOS (Copias fieles del diseño)
    const categoriaTag = `<div class="bg-black/70 px-3 py-1 rounded-full border border-primary/50 w-fit backdrop-blur-sm shadow-md"><span class="font-label-bold text-[10px] text-tertiary tracking-wide uppercase">${escapeHTML(item.categoria || 'Entradas')}</span></div>`;
    const promoTag = hasPromoText ? `<div class="bg-primary text-sushi-white font-label-bold text-[10px] px-2 py-1 rounded shadow-lg transform -rotate-3 border border-sushi-white/20 w-fit text-center leading-tight mt-1">${escapeHTML(item.texto_promo)}</div>` : '';
    const picanteTag = isPicante ? `<div class="flex items-center gap-1 bg-primary/20 border border-primary/40 px-2 py-0.5 rounded text-primary text-[9px] font-bold uppercase tracking-wider w-fit"><span class="material-symbols-outlined text-[12px]">local_fire_department</span> Picante</div>` : '';
    const imgTag = optimizedImgUrl ? `<img src="${escapeHTML(optimizedImgUrl)}" alt="${escapeHTML(item.nombre)}" loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />` : `<span class="font-label-bold text-on-surface-variant z-0">Sin imagen</span>`;

    // =========================================================
    // TRAMPA ABSOLUTA: VISTA PREVIA (MODAL ADMIN)
    // Devuelve SOLO el esqueleto móvil, sin botones y aborta la función.
    // =========================================================
    if (rol === 'preview') {
      return `
        <div class="flex flex-col w-full h-full bg-[#121212] rounded-xl border border-primary-container/20 overflow-hidden relative shadow-lg">
          <div class="aspect-[3/4] w-full relative bg-surface-container-highest flex items-center justify-center overflow-hidden shrink-0">
            ${imgTag}
            <div class="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
              ${categoriaTag}
              ${promoTag}
            </div>
          </div>
          <div class="p-4 flex flex-col flex-grow bg-[#121212]">
            <div class="flex items-start justify-between gap-3 mb-2">
              <h3 class="font-headline-lg-mobile text-xl text-primary leading-tight">${escapeHTML(item.nombre)}</h3>
              <div class="bg-[#1f1f1f] px-3 py-1 rounded-full font-price-display text-[13px] text-sushi-white border border-outline-variant/30 shadow-md shrink-0">
                ${precioFormatted}
              </div>
            </div>
            <p class="font-body-md text-on-surface-variant text-sm flex-grow line-clamp-3">${escapeHTML(item.descripcion || '')}</p>
            <div class="mt-3 flex gap-2 empty:hidden">${picanteTag}</div>
          </div>
        </div>
      `;
    }

    // =========================================================
    // LÓGICA DE BOTONES PARA ADMIN GRID Y MENU CLIENTE
    // =========================================================
    const isSelected = currentSelection.some(i => i.id === itemId);
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-60 grayscale-[40%] border-primary/40' : '';
    const mobileAdminStyles = rol === 'admin' && isPausado ? 'border-primary/40 opacity-60 grayscale-[40%]' : 'border-primary-container/20';

    let pcActionButtons = '';
    let mobileActionContainer = '';

    if (rol === 'admin') {
      pcActionButtons = `
        <button data-action="toggle-pause" data-id="${escapeHTML(item.id)}" title="Retira el plato" class="w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPausado ? 'bg-primary text-sushi-white' : 'bg-surface-variant text-on-surface hover:bg-surface-bright'}"><span class="material-symbols-outlined text-[20px] pointer-events-none">pause_circle</span></button>
        <button data-action="edit" data-id="${escapeHTML(item.id)}" title="Editar" class="w-10 h-10 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px] pointer-events-none">edit</span></button>
        <button data-action="delete" data-id="${escapeHTML(item.id)}" title="Borrar" class="w-10 h-10 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"><span class="material-symbols-outlined text-[20px] pointer-events-none">delete</span></button>`;
      
      mobileActionContainer = `
        <div class="flex justify-end gap-2 pt-2 mt-4">
          <button data-action="toggle-pause" data-id="${escapeHTML(item.id)}" class="w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isPausado ? 'bg-primary text-sushi-white' : 'bg-surface-variant text-on-surface hover:bg-surface-bright'}"><span class="material-symbols-outlined text-[18px] pointer-events-none">pause_circle</span></button>
          <button data-action="edit" data-id="${escapeHTML(item.id)}" class="w-9 h-9 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-primary/20 hover:text-primary"><span class="material-symbols-outlined text-[18px] pointer-events-none">edit</span></button>
          <button data-action="delete" data-id="${escapeHTML(item.id)}" class="w-9 h-9 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-error/20 hover:text-error"><span class="material-symbols-outlined text-[18px] pointer-events-none">delete</span></button>
        </div>`;
    } else {
      pcActionButtons = `
        <span class="text-[11px] text-secondary/60 italic font-body-md">Foto referencial</span>
        <button data-action="toggle-select" data-id="${escapeHTML(itemId)}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-wasabi-green text-surface font-bold shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20'}" title="Agregar"><span class="material-symbols-outlined pointer-events-none">${isSelected ? 'playlist_add_check' : 'format_list_bulleted_add'}</span></button>`;
      
      mobileActionContainer = `
        <div class="flex justify-between items-center gap-2 pt-2 mt-4">
          <span class="text-[11px] text-secondary/60 italic font-body-md">Foto referencial</span>
          <button data-action="toggle-select" data-id="${escapeHTML(itemId)}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-wasabi-green text-surface font-bold shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20'}"><span class="material-symbols-outlined text-[18px] pointer-events-none">${isSelected ? 'playlist_add_check' : 'format_list_bulleted_add'}</span></button>
        </div>`;
    }

    // =========================================================
    // TARJETAS DEFINITIVAS (PC y Móvil)
    // =========================================================
    const pcCard = `
      <div class="hidden sm:flex menu-card bg-surface-container-low rounded-xl border border-primary/20 overflow-hidden flex-col sm:flex-row glow-hover transition-all duration-300 relative group ${adminStyles}">
        <div class="menu-card-img-wrapper bg-surface-container-highest flex items-center justify-center shrink-0 min-h-[240px] sm:w-2/5 w-full relative overflow-hidden">
          ${imgTag}
          <div class="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
            ${categoriaTag}
            ${promoTag}
          </div>
        </div>
        <div class="p-5 w-full sm:w-3/5 flex flex-col flex-grow">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="flex flex-col gap-1.5">
              <h3 class="font-headline-lg-mobile text-xl text-primary leading-tight">${escapeHTML(item.nombre)}</h3>
              <div class="flex items-center gap-2 empty:hidden">${picanteTag}</div>
            </div>
            <div class="bg-[#1f1f1f] px-3 py-1 rounded-full font-price-display text-[14px] text-sushi-white border border-outline-variant/30 shadow-md shrink-0 mt-1 sm:mt-0">
              ${precioFormatted}
            </div>
          </div>
          <p data-expandable="true" class="font-body-md text-secondary text-sm mb-4 flex-grow line-clamp-3 cursor-pointer select-none transition-all duration-200 mt-2" title="Toca para expandir">${escapeHTML(item.descripcion || '')}</p>
          <div class="flex justify-${rol === 'admin' ? 'end' : 'between items-center'} gap-2 pt-4 border-t border-outline-variant/20 mt-auto">
            ${pcActionButtons}
          </div>
        </div>
      </div>
    `;

    const mobileCard = `
      <div class="flex sm:hidden flex-col w-full h-full bg-[#121212] rounded-xl border ${mobileAdminStyles} overflow-hidden relative glow-hover transition-all duration-300 group">
        <div class="aspect-[3/4] w-full relative bg-surface-container-highest flex items-center justify-center overflow-hidden shrink-0">
          ${imgTag}
          <div class="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
            ${categoriaTag}
            ${promoTag}
          </div>
        </div>
        <div class="p-4 flex flex-col flex-grow bg-[#121212]">
          <div class="flex items-start justify-between gap-3 mb-2">
            <h3 class="font-headline-lg-mobile text-xl text-primary leading-tight">${escapeHTML(item.nombre)}</h3>
            <div class="bg-[#1f1f1f] px-3 py-1 rounded-full font-price-display text-[13px] text-sushi-white border border-outline-variant/30 shadow-md shrink-0">
              ${precioFormatted}
            </div>
          </div>
          <p class="font-body-md text-on-surface-variant text-sm flex-grow line-clamp-3">${escapeHTML(item.descripcion || '')}</p>
          <div class="mt-3 flex gap-2 empty:hidden">${picanteTag}</div>
          ${mobileActionContainer}
        </div>
      </div>
    `;

    return pcCard + mobileCard;
  }
};