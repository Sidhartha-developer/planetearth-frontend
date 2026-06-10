import axios from "./axiosInstance"; 

export const getAllBlogsAdmin = () =>
  axios.get("/api/blogs/admin/all");

export const createBlog = (data) =>
  axios.post("/api/blogs", data);

export const updateBlog = (id, data) =>
  axios.put(`/api/blogs/${id}`, data);

export const publishBlog = (id) =>
  axios.put(`/api/blogs/${id}/publish`);

export const unpublishBlog = (id) =>
  axios.put(`/api/blogs/${id}/unpublish`);

export const deleteBlog = (id) =>
  axios.delete(`/api/blogs/${id}`);

export const incrementBlogView = (id) =>
  axios.post(`/api/blogs/${id}/view`);
