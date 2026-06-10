// src/api/leadApi.js
import axiosInstance from "./axiosInstance";

// ================== CREATE NEW LEAD ==================
export const createLead = async (leadData, token) => {
  try {
    const response = await axiosInstance.post("/api/leads", leadData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create lead." };
  }
};

// ================== GET ALL LEADS ==================
export const getAllLeads = async (token, params = {}) => {
  try {
    const response = await axiosInstance.get("/api/leads", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch leads." };
  }
};

// ================== UPDATE LEAD ==================
export const updateLead = async (id, updatedData, token) => {
  try {
    const response = await axiosInstance.put(`/api/leads/${id}`, updatedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update lead." };
  }
};


export const deleteLead = async (id, token) => {
  try {
    const response = await axiosInstance.delete(`/api/leads/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Delete lead error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to delete lead." };
  }
};

// ================== BULK CREATE/UPDATE LEADS (Admin only) ==================
export const bulkUpdateLeads = async (leadsArray, token) => {
  try {
    const response = await axiosInstance.post(
      "/api/leads/bulk",
      { leads: leadsArray },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to bulk update leads." };
  }
};

/**
 * Get all staff members (Admin only)
 * @param {string} token - Admin JWT token
 * @returns {Promise} Axios response with staff data
 */
export const getAllStaff = async (token) => {
  try {
    const response = await axiosInstance.get("/api/leads/staff-members", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data; // { success, total, data }
  } catch (error) {
    console.error('Error fetching staff:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get all leads assigned to the logged-in staff with optional filters
 * @param {string} token - Staff JWT token
 * @param {object} filters - Optional filters: { search, leadStatus }
 * @returns {Promise} Axios response with leads data
 */
export const getMyLeads = async (token, filters = {}) => {
  try {
    const response = await axiosInstance.get("/api/leads/my-leads", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        ...(filters.search && { search: filters.search }),
        ...(filters.leadStatus && { leadStatus: filters.leadStatus }),
      },
    });

    return response.data; // { success, total, data }
  } catch (error) {
    console.error("Error fetching my leads:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to fetch leads." };
  }
};

