import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

// Public submit testimonial
export const submitTestimonial = (formData) =>
  axios.post(`${API}/api/testimonials/public`, formData);

// Get approved testimonials (public)
export const getApprovedTestimonials = () =>
  axios.get(`${API}/api/testimonials/approved`);
