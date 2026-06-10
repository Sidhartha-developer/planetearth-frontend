import axiosInstance from "./axiosInstance";


// Create new client (admin/office)
export const createClient = async (clientData, token) => {
  try {
    const response = await axiosInstance.post("/api/clients", clientData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create client." };
  }
};

// Get all clients with optional filters
export const getClients = async (params = {}, token) => {
  try {
    const response = await axiosInstance.get("/api/clients", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch clients." };
  }
};

// Get single client by ID or serial number
export const getClientById = async (id, token) => {
  try {
    const response = await axiosInstance.get(`/api/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch client." };
  }
};

// Update existing client (admin/office)
export const updateClient = async (id, clientData, token) => {
  try {
    const response = await axiosInstance.put(`/api/clients/${id}`, clientData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update client." };
  }
};

// Delete client (admin only)
export const deleteClient = async (id, token) => {
  try {
    const response = await axiosInstance.delete(`/api/clients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete client." };
  }
};

// Get client statistics (admin only)
export const getClientStats = async (token) => {
  try {
    const response = await axiosInstance.get("/api/clients/stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch client stats." };
  }
};
