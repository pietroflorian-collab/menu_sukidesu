// Remplaza este valor con la URL pública generada por Google Apps Script
const API_URL = "https://script.google.com/macros/s/AKfycbxMm4fExrDZM9X3A6NNoPH3dWTlUs2UQDU8aqvpMQQEBSgYQmYdcL5ZecDlUYtJtY25/exec";

const MenuAPI = {
  async fetchItems() {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      return result.status === "success" ? result.data : [];
    } catch (error) {
      console.error("Error al obtener los platos:", error);
      return [];
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
      console.error("Error al crear el plato:", error);
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
      console.error("Error al actualizar el plato:", error);
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
      console.error("Error al eliminar el plato:", error);
      return { status: "error", message: error.toString() };
    }
  }
};// ... (código anterior de MenuAPI)

function formatPrice(price) {
  const amount = parseFloat(price) || 0;
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount);
}