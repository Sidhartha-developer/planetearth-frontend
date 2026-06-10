import axiosInstance from "./axiosInstance";

// Create a new product
export const createProduct = async (productData, token) => {
  try {
    const response = await axiosInstance.post("/api/products", productData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create product." };
  }
};

// Get all products (optional filter: ?status=active or ?status=low-stock)
export const getAllProducts = async (token, status = "") => {
  try {
    const url = status ? `/api/products?status=${status}` : "/api/products";
    const response = await axiosInstance.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch products." };
  }
};

// Get a single product by ID
export const getProductById = async (id, token) => {
  try {
    const response = await axiosInstance.get(`/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch product details." };
  }
};

// Update product stock (add/remove/adjust)
export const updateProductStock = async (id, stockData, token) => {
  try {
    const response = await axiosInstance.put(
      `/api/products/${id}/stock`,
      stockData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update product stock." };
  }
};

// Update product settings (lowStockThreshold, outOfStockThreshold)
export const updateProduct = async (id, updateData, token) => {
  try {
    const response = await axiosInstance.put(`/api/products/${id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update product." };
  }
};

// Get low stock products
export const getLowStockProducts = async (token) => {
  try {
    const response = await axiosInstance.get("/api/products/low-stock", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch low stock products." };
  }
};

export const getAllProductsList = async (token) => {
  try {
    const res = await axiosInstance.get('/api/products', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error.response?.data || { message: "Server error" };
  }
};