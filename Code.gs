function doGet(e) {
  return handleRead(e);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var payload = contents.data || contents; // Soporte por si payload viene directo
    
    // Acciones de Platos
    if (action === "create") return handleCreate(payload);
    if (action === "update") return handleUpdate(payload);
    if (action === "delete") return handleDelete(payload);
    
    // Acciones de Categorías
    if (action === "create_category") return handleCreateCategory(payload);
    if (action === "update_category") return handleUpdateCategory(payload);
    if (action === "delete_category") return handleDeleteCategory(payload);
    
    // Acciones de Configuración (Banner Promo)
    if (action === "updateConfig") return handleUpdateConfig(payload);
    
    return responseJSON({ status: "error", message: "Acción no reconocida" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

/* =========================================
 * FUNCIONES PARA OBTENER HOJAS (SHEETS)
 * ========================================= */

function getMainSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Hoja 1") || ss.getSheetByName("Platos");
  if (sheet) return sheet;
  
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() !== "Categorias" && sheets[i].getName() !== "Config") {
      return sheets[i];
    }
  }
  return sheets[0];
}

function getCategorySheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Categorias");
  if (!sheet) {
    sheet = ss.insertSheet("Categorias");
    sheet.appendRow(["id", "nombre", "es_pausada"]);
    var defaultCats = [
      ["cat_1", "Entradas", false],
      ["cat_2", "Rollos Clásicos", false],
      ["cat_3", "Rollos de Autor", false],
      ["cat_4", "Sushi Perros", false],
      ["cat_5", "Especiales", false],
      ["cat_6", "Ramen", false],
      ["cat_7", "Combos y Promos", false],
      ["cat_8", "Barra y Bebidas", false]
    ];
    for (var i = 0; i < defaultCats.length; i++) {
      sheet.appendRow(defaultCats[i]);
    }
  }
  return sheet;
}

function getConfigSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Config");
  if (!sheet) {
    sheet = ss.insertSheet("Config");
    sheet.appendRow(["clave", "valor"]);
    sheet.appendRow(["promo_activa", "false"]);
    sheet.appendRow(["promo_texto", "¡Promoción especial disponible hoy!"]);
    sheet.appendRow(["promo_imagen", "images/niguiripromo.png"]);
  }
  return sheet;
}

/* =========================================
 * LECTURA GLOBAL (Menú Cliente y Admin)
 * ========================================= */

function handleRead(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var mainSheet = getMainSheet();
  var catSheet = getCategorySheet();
  var configSheet = getConfigSheet();
  
  var isAdmin = e && e.parameter && e.parameter.admin === "true";
  
      // 1. Leer Configuración Global
    var configData = configSheet.getDataRange().getValues();
    var config = {};
    for (var c = 1; c < configData.length; c++) {
      var key = configData[c][0];
      var value = configData[c][1];
      
      // Parseo estricto para evitar falsos positivos en JavaScript
      if (String(value).toLowerCase() === "true") value = true;
      if (String(value).toLowerCase() === "false") value = false;
      
      config[key] = value;
    }

  // 2. Leer Categorías
  var catData = catSheet.getDataRange().getValues();
  var categories = [];
  for (var i = 1; i < catData.length; i++) {
    var row = catData[i];
    if (!row[0]) continue;
    var isPausada = String(row[2]).toLowerCase() === "true";
    
    if (!isAdmin && isPausada) continue;
    
    categories.push({
      id: row[0],
      nombre: row[1],
      es_pausada: isPausada
    });
  }
  
  var activeCatNames = categories.map(function(c) { return c.nombre; });
  
  // 3. Leer Platos
  var mainData = mainSheet.getDataRange().getValues();
  var items = [];
  if (mainData.length > 1) {
    var headers = mainData[0];
    for (var j = 1; j < mainData.length; j++) {
      var itemRow = mainData[j];
      if (!itemRow[0]) continue; // Saltar filas vacías
      
      var item = {};
      for (var k = 0; k < headers.length; k++) {
        item[headers[k]] = itemRow[k];
      }
      
      var itemPausado = String(item.es_pausado).toLowerCase() === "true";
      var catValida = activeCatNames.indexOf(item.categoria) !== -1;
      
      if (!isAdmin) {
        if (itemPausado || !catValida) continue;
      }
      
      items.push(item);
    }
  }
  
  return responseJSON({ 
    status: "success", 
    items: items,         // El frontend lo espera como "items", no "data"
    categories: categories, 
    config: config 
  });
}

/* =========================================
 * ACCIONES DE CONFIGURACIÓN
 * ========================================= */

function handleUpdateConfig(payload) {
  var sheet = getConfigSheet();

  function upsertConfig(key, value) {
    var data = sheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] == key) {
        sheet.getRange(i + 1, 2).setValue(value);
        found = true;
        break;
      }
    }
    if (!found) sheet.appendRow([key, value]);
  }

  if (payload.promo_activa !== undefined) {
    upsertConfig("promo_activa", payload.promo_activa);
  }
  
  if (payload.promo_texto !== undefined) {
    upsertConfig("promo_texto", payload.promo_texto);
  }
  
  // Enviar a Drive si es archivo local, o guardar URL directa si es un enlace existente
  if (payload.promo_imagen_base64) {
    var driveUrl = saveImageToDrive(payload.promo_imagen_base64, "promo_" + new Date().getTime());
    if (driveUrl) upsertConfig("promo_imagen", driveUrl);
  } else if (payload.promo_imagen !== undefined && payload.promo_imagen !== "") {
    upsertConfig("promo_imagen", payload.promo_imagen);
  }

  return responseJSON({ status: "success", message: "Configuración actualizada" });
}


/* =========================================
 * ACCIONES DE PLATOS
 * ========================================= */

function handleCreate(payload) {
  var sheet = getMainSheet();
  var newId = "item_" + new Date().getTime();
  
  var imageUrl = payload.imagen_url || "";
  if (payload.imagen_base64) {
    var driveUrl = saveImageToDrive(payload.imagen_base64, newId);
    if (driveUrl) imageUrl = driveUrl;
  }

  var newRow = [
    newId,
    payload.nombre || "",
    parseFloat(payload.precio) || 0,
    payload.categoria || "Entradas",
    payload.descripcion || "",
    imageUrl,
    payload.es_picante ? true : false,
    payload.es_pausado ? true : false,
    payload.dias_promo || "",
    payload.texto_promo || ""
  ];
  
  // Validar encabezados si la hoja está vacía
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["id", "nombre", "precio", "categoria", "descripcion", "imagen_url", "es_picante", "es_pausado", "dias_promo", "texto_promo"]);
  }
  
  sheet.appendRow(newRow);
  return responseJSON({ status: "success", id: newId, imagen_url: imageUrl });
}

function handleUpdate(payload) {
  var sheet = getMainSheet();
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      var imageUrl = data[i][5]; 
      
      if (payload.imagen_base64) {
        var driveUrl = saveImageToDrive(payload.imagen_base64, id);
        if (driveUrl) imageUrl = driveUrl;
      } else if (payload.imagen_url !== undefined && payload.imagen_url !== "") {
        imageUrl = payload.imagen_url;
      }

      var updatedRow = [
        id,
        payload.nombre !== undefined ? payload.nombre : data[i][1],
        payload.precio !== undefined ? (parseFloat(payload.precio) || 0) : data[i][2],
        payload.categoria !== undefined ? payload.categoria : data[i][3],
        payload.descripcion !== undefined ? payload.descripcion : data[i][4],
        imageUrl,
        payload.es_picante !== undefined ? (payload.es_picante ? true : false) : data[i][6],
        payload.es_pausado !== undefined ? (payload.es_pausado ? true : false) : data[i][7],
        payload.dias_promo !== undefined ? payload.dias_promo : (data[i][8] || ""),
        payload.texto_promo !== undefined ? payload.texto_promo : (data[i][9] || "")
      ];
      sheet.getRange(i + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
      return responseJSON({ status: "success", id: id, imagen_url: imageUrl });
    }
  }
  return responseJSON({ status: "error", message: "Plato no encontrado" });
}

function handleDelete(payload) {
  var sheet = getMainSheet();
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.deleteRow(i + 1);
      return responseJSON({ status: "success", message: "Plato eliminado" });
    }
  }
  return responseJSON({ status: "error", message: "Plato no encontrado" });
}

/* =========================================
 * ACCIONES DE CATEGORÍAS
 * ========================================= */

function handleCreateCategory(payload) {
  var sheet = getCategorySheet();
  var newId = "cat_" + new Date().getTime();
  var nombre = (payload.nombre || "").trim();
  
  if (!nombre) {
    return responseJSON({ status: "error", message: "El nombre de la categoría no puede estar vacío" });
  }
  
  sheet.appendRow([newId, nombre, false]);
  return responseJSON({ status: "success", id: newId, nombre: nombre });
}

function handleUpdateCategory(payload) {
  var sheet = getCategorySheet();
  var data = sheet.getDataRange().getValues();
  var id = payload.id;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      var nombre = payload.nombre !== undefined ? payload.nombre : data[i][1];
      var esPausada = payload.es_pausada !== undefined ? payload.es_pausada : data[i][2];
      
      sheet.getRange(i + 1, 1, 1, 3).setValues([[id, nombre, esPausada ? true : false]]);
      return responseJSON({ status: "success", id: id });
    }
  }
  return responseJSON({ status: "error", message: "Categoría no encontrada" });
}

function handleDeleteCategory(payload) {
  var catSheet = getCategorySheet();
  var mainSheet = getMainSheet();
  
  var catData = catSheet.getDataRange().getValues();
  var id = payload.id;
  var catNombre = "";
  var rowIndex = -1;
  
  for (var i = 1; i < catData.length; i++) {
    if (catData[i][0] == id) {
      catNombre = catData[i][1];
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return responseJSON({ status: "error", message: "Categoría no encontrada" });
  }
  
  var mainData = mainSheet.getDataRange().getValues();
  var dishCount = 0;
  for (var j = 1; j < mainData.length; j++) {
    if (mainData[j][3] === catNombre) {
      dishCount++;
    }
  }
  
  if (dishCount > 0) {
    return responseJSON({ 
      status: "error", 
      message: "No es posible eliminar la categoría '" + catNombre + "' porque tiene " + dishCount + " plato(s) vinculado(s). Reubica o elimina los platos primero, o pausa la categoría." 
    });
  }
  
  catSheet.deleteRow(rowIndex);
  return responseJSON({ status: "success", message: "Categoría eliminada" });
}

/* =========================================
 * FUNCIONES UTILITARIAS
 * ========================================= */

function saveImageToDrive(base64Data, filename) {
  try {
    if (!base64Data || typeof base64Data !== 'string' || !base64Data.indexOf(",") === -1) {
      return "";
    }
    var folderName = "Fotos_Menu_Sukidesu";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var splitData = base64Data.split(",");
    var contentType = splitData[0].split(":")[1].split(";")[0];
    var bytes = Utilities.base64Decode(splitData[1]);
    var blob = Utilities.newBlob(bytes, contentType, filename + ".webp");
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w400";
  } catch (err) {
    Logger.log("Error en saveImageToDrive: " + err.toString());
    return "";
  }
}

  return responseJSON({ 
    status: "success", 
    data: items,         // Para que tu api.js lo reconozca como antes
    items: items,        // Para que el HTML nuevo lo lea directamente
    categories: categories, 
    config: config 
  });
}
