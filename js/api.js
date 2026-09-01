const API_URL = "https://script.google.com/macros/s/AKfycbyJffKPdCbyWQGftl_Ay7VK28yQM5iJE1FMN4b97_yxCUvteTWzl5e1L4xmYtDxUz8/exec";

const MenuAPI = {
  async fetchItems(isAdmin = false) {
    try {
      const url = isAdmin ? `${API_URL}?admin=true` : API_URL;
      const response = await fetch(url);
      const result = await response.json();
      if (result.status === "success") {
        return {
          items: result.data || [],
          categories: result.categories || []
        };
      }
      return { items: [], categories: [] };
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      return { items: [], categories: [] };
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
      console.error("Error al crear la categoría:", error);
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
      console.error("Error al actualizar la categoría:", error);
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
      console.error("Error al eliminar la categoría:", error);
      return { status: "error", message: error.toString() };
    }
  }
};

function formatPrice(price) {
  const amount = parseFloat(price) || 0;
  return '$' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(amount);
}