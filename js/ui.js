const UI = {
  generarTarjetaPlato(item, rol, currentSelection = []) {
    const isPausado = String(item.es_pausado).toLowerCase() === "true";
    const rawUrl = item.imagen_url || '';
    const optimizedImgUrl = rawUrl.replace('sz=w800', 'sz=w400');
    const isPicante = String(item.es_picante).toLowerCase() === "true";
    const hasPromoText = item.texto_promo && item.texto_promo.trim() !== "";
    
    const adminStyles = rol === 'admin' && isPausado ? 'opacity-60 grayscale-[40%] border-primary/40' : '';
    const adminImageTag = optimizedImgUrl 
      ? `<img src="${escapeHTML(optimizedImgUrl)}" alt="${escapeHTML(item.nombre)}" loading="lazy" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />` 
      : `<span class="font-label-bold text-secondary">Sin imagen</span>`;

    // Etiqueta Promocional (Banner Rojo) - Usamos la paleta de colores nativos
    const promoBannerTag = hasPromoText 
      ? `<div class="absolute top-2 right-2 bg-primary text-sushi-white font-label-bold text-[10px] px-2.5 py-1 rounded shadow-lg transform rotate-3 z-20 border border-sushi-white/20 max-w-[120px] text-center leading-tight shadow-primary/30">${escapeHTML(item.texto_promo)}</div>` 
      : '';

    let actionButtons = '';
    if (rol === 'admin') {
       actionButtons = `
        <button data-action="toggle-pause" data-id="${escapeHTML(item.id)}" title="Retira el plato del Menú" class="w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isPausado ? 'bg-primary text-sushi-white' : 'bg-surface-variant text-on-surface hover:bg-surface-bright'}">
          <span class="material-symbols-outlined text-[20px] pointer-events-none">pause_circle</span>
        </button>
        <button data-action="edit" data-id="${escapeHTML(item.id)}" title="Editar Plato" class="w-10 h-10 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[20px] pointer-events-none">edit</span>
        </button>
        <button data-action="delete" data-id="${escapeHTML(item.id)}" title="Borrar Plato" class="w-10 h-10 rounded-full bg-surface-variant text-on-surface flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors">
          <span class="material-symbols-outlined text-[20px] pointer-events-none">delete</span>
        </button>`;
    } else {
       const itemId = item.id || item.nombre;
       const isSelected = currentSelection.some(i => i.id === itemId);
       actionButtons = `
        <span class="text-[11px] text-secondary/60 italic font-body-md">Foto referencial</span>
        <button data-action="toggle-select" data-id="${escapeHTML(itemId)}" data-name="${escapeHTML(item.nombre).replace(/'/g, "\\'")}" class="w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isSelected ? 'bg-wasabi-green text-surface font-bold shadow-md' : 'bg-primary/10 text-primary hover:bg-primary/20'}" title="Agregar o remover">
          <span class="material-symbols-outlined pointer-events-none">${isSelected ? 'playlist_add_check' : 'format_list_bulleted_add'}</span>
        </button>`;
    }

    return `
      <div class="menu-card bg-surface-container-low rounded-lg border border-primary/20 overflow-hidden flex flex-col sm:flex-row glow-hover transition-all duration-300 relative group ${adminStyles}">
        <div class="menu-card-img-wrapper bg-surface-container-highest flex items-center justify-center shrink-0 min-h-[240px] sm:w-2/5 w-full relative">
          ${adminImageTag}
          <div class="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none z-10">
            <div class="bg-surface-container-high/90 px-3 py-1 rounded-full border border-outline-variant/50 w-fit max-w-full">
              <span class="font-label-bold text-xs text-tertiary truncate block">${escapeHTML(item.categoria || 'Entradas')}</span>
            </div>
          </div>
          ${promoBannerTag}
        </div>
        <div class="p-5 w-full sm:w-3/5 flex flex-col flex-grow">
          <div class="flex items-start justify-between gap-2 mb-2">
            <div class="flex flex-col gap-1.5">
              <h3 class="font-headline-lg-mobile text-xl text-primary leading-tight">${escapeHTML(item.nombre)}</h3>
              <div class="flex items-center gap-2">
                ${isPicante ? `<div class="flex items-center gap-1 bg-primary/20 border border-primary/40 px-2 py-0.5 rounded text-primary text-[10px] font-bold uppercase tracking-wider w-fit"><span class="material-symbols-outlined text-[14px]">local_fire_department</span> Picante</div>` : ''}
              </div>
            </div>
            <div class="bg-surface-container-highest px-3 py-1 rounded-full font-price-display text-base text-sushi-white border border-outline-variant/50 shadow-md shrink-0 mt-1 sm:mt-0">
              ${formatPrice(item.precio)}
            </div>
          </div>
          <p data-expandable="true" class="font-body-md text-secondary text-sm mb-4 flex-grow line-clamp-3 cursor-pointer select-none transition-all duration-200 mt-2" title="Toca para expandir">${escapeHTML(item.descripcion || '')}</p>
          <div class="flex justify-${rol === 'admin' ? 'end' : 'between items-center'} gap-2 pt-4 border-t border-outline-variant/20 mt-auto">
            ${actionButtons}
          </div>
        </div>
      </div>
    `;
  }
};