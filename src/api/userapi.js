import axiosInstance from "./axiosInstance";

export const getProfile = async (token) => {
  try {

    const response = await axiosInstance.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data?.data;

    return userData; // only returning the user object
  } catch (error) {
    console.error("❌ Failed to fetch profile:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to fetch user profile." };
  }
};
