
// ====================================
// 🔹 AMC APIs
// ====================================

import axiosInstance from "./axiosInstance";

// Get all AMCs
export const getAllAMCs = async (params, token) => {
  try {
    const response = await axiosInstance.get("/api/amcs", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch AMCs." };
  }
};

// Get single AMC by ID
export const getAMCById = async (id, token) => {
  try {
    const response = await axiosInstance.get(`/api/amcs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch AMC details." };
  }
};

// Create new AMC
export const createAMC = async (data, token) => {
  try {
    const response = await axiosInstance.post("/api/amcs", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create AMC." };
  }
};

// Update AMC
export const updateAMC = async (id, data, token) => {
  try {
    const response = await axiosInstance.put(`/api/amcs/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update AMC." };
  }
};

// Cancel AMC
export const cancelAMC = async (id, data, token) => {
  try {
    const response = await axiosInstance.put(`/api/amcs/${id}/cancel`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to cancel AMC." };
  }
};

// Delete AMC
export const deleteAMC = async (id, token) => {
  try {
    const response = await axiosInstance.delete(`/api/amcs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete AMC." };
  }
};

// ====================================
// 🔹 VISIT APIs
// ====================================

// Update visit details
export const updateAMCVisit = async (id, visitNumber, data, token) => {
  try {
    const response = await axiosInstance.put(
      `/api/amcs/${id}/visits/${visitNumber}`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update visit." };
  }
};

// Complete visit
export const completeAMCVisit = async (id, visitNumber, data, token) => {
  try {
    const response = await axiosInstance.put(
      `/api/amcs/${id}/visits/${visitNumber}/complete`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to complete visit." };
  }
};

// Reschedule visit
export const rescheduleAMCVisit = async (id, visitNumber, data, token) => {
  try {
    const response = await axiosInstance.put(
      `/api/amcs/${id}/visits/${visitNumber}/reschedule`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to reschedule visit." };
  }
};

// ====================================
// 🔹 DASHBOARD / ANALYTICS APIs
// ====================================

// Get upcoming visits
export const getUpcomingVisits = async (params, token) => {
  try {
    const response = await axiosInstance.get("/api/amcs/upcoming-visits", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch upcoming visits." };
  }
};

// Get expiring AMCs
export const getExpiringAMCs = async (params, token) => {
  try {
    const response = await axiosInstance.get("/api/amcs/expiring", {
      params,
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch expiring AMCs." };
  }
};
