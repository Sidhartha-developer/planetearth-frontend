import axiosInstance from "./axiosInstance";


// Get all installations (with optional filters)
export const getAllInstallations = async (token, filters = {}) => {
  try {
    const response = await axiosInstance.get("/api/installations", {
      headers: { Authorization: `Bearer ${token}` },
      params: filters, // { status, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch installations." };
  }
};

// Create a new installation
export const createInstallation = async (installationData, token) => {
  try {
    const response = await axiosInstance.post("/api/installations", installationData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create installation." };
  }
};

// Update installation
export const updateInstallation = async (id, updateData, token) => {
  try {
    const response = await axiosInstance.put(`/api/installations/${id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update installation." };
  }
};

// Mark installation as completed
export const completeInstallation = async (id, completionData, token) => {
  try {
    const response = await axiosInstance.put(`/api/installations/${id}/complete`, completionData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to complete installation." };
  }
};

// Forward installation to client data
export const forwardToClientData = async (id, clientData, token) => {
  try {
    const response = await axiosInstance.post(`/api/installations/${id}/forward-to-client`, clientData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to forward installation to client data." };
  }
};

// Delete installation
export const deleteInstallation = async (id, token) => {
  try {
    const response = await axiosInstance.delete(`/api/installations/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete installation." };
  }
};
