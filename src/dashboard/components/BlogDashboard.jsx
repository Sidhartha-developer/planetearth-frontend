import React, { useState, useEffect } from "react";
import { getAllBlogsAdmin, 
  createBlog, 
  updateBlog,
  publishBlog, 
  unpublishBlog,
   } from "@/api/blogApi";



/* ---------------- CONSTANTS ---------------- */

const STATUS_TABS = ["all", "draft", "scheduled", "published", "unpublished"];

/* ---------------- BLOG DASHBOARD ---------------- */

const BlogDashboard = () => {
const [activeTab, setActiveTab] = useState("all");
const [blogs, setBlogs] = useState([]);
const [loading, setLoading] = useState(true);
const [editorOpen, setEditorOpen] = useState(false);
const [editingBlogId, setEditingBlogId] = useState(null);
const [imagePreview, setImagePreview] = useState(null);
const [imageFile, setImageFile] = useState(null);
const [previewMode, setPreviewMode] = useState(false);
const [scheduleMode, setScheduleMode] = useState(false);
const [formData, setFormData] = useState({
  title: "",
  category: "",
  tags: "",
  excerpt: "",
  content: "",
  coverImage: null,
  publishAt: "",
});


const fetchBlogs = async () => {
  try {
    const res = await getAllBlogsAdmin();
    setBlogs(res.data.blogs || []);
  } catch (error) {
    console.error("Failed to fetch blogs", error);
  } finally {
    setLoading(false);
  }
};

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setImageFile(file);

  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result); 
  };
  reader.readAsDataURL(file);
};



const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const handleCreateBlog = async () => {
  try {
    const data = new FormData();

    data.append("title", formData.title);
    data.append("category", formData.category);
    data.append("excerpt", formData.excerpt);
    data.append("content", formData.content);
    data.append(
      "tags",
      formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .join(",")
    );

    data.append(
      "status",
      scheduleMode ? "scheduled" : "draft"
    );

    if (scheduleMode && formData.publishAt) {
      data.append("publishAt", formData.publishAt);
    }

    if (imageFile) {
      data.append("coverImage", imageFile); // 🔥 THIS KEY MUST MATCH MULTER
    }

    await createBlog(data);

    // reset
    setEditorOpen(false);
    setImagePreview(null);
    setImageFile(null);

    setFormData({
      title: "",
      category: "",
      tags: "",
      excerpt: "",
      content: "",
      publishAt: "",
    });

    fetchBlogs();
  } catch (error) {
    console.error("Failed to create blog", error);
  }
};


const handleEditClick = (blog) => {
  setPreviewMode(false);
  setScheduleMode(blog.status === "scheduled");
  setEditingBlogId(blog._id);
setFormData({
  title: blog.title || "",
  category: blog.category || "",
  tags: blog.tags ? blog.tags.join(", ") : "",
  excerpt: blog.excerpt || "",
  content: blog.content || "",
  coverImage: blog.coverImage || "",
  publishAt: blog.publishAt
    ? new Date(blog.publishAt).toISOString().slice(0, 16)
    : "",
});
  setEditorOpen(true);
};

const handleUpdateBlog = async () => {
  try {
    await updateBlog(editingBlogId, {
      title: formData.title,
      slug: generateSlug(formData.title),
      category: formData.category,
      excerpt: formData.excerpt,
      content: formData.content,
      coverImage: formData.coverImage,
      tags: formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status: scheduleMode ? "scheduled" : undefined,
      publishAt: scheduleMode ? formData.publishAt : null,
    });

    setEditorOpen(false);
    setImagePreview(null);
    setEditingBlogId(null);
    setFormData({
      title: "",
      category: "",
      tags: "",
      excerpt: "",
      content: "",
    });

    fetchBlogs();
  } catch (error) {
    console.error("Failed to update blog", error);
  }
};



const handlePublish = async (id) => {
  try {
    await publishBlog(id);
    fetchBlogs();
  } catch (error) {
    console.error("Failed to publish blog", error);
  }
};

const handleUnpublish = async (id) => {
  try {
    await unpublishBlog(id);
    fetchBlogs();
  } catch (error) {
    console.error("Failed to unpublish blog", error);
  }
};




useEffect(() => {
  fetchBlogs();
}, []);

const stats = {
  total: blogs.length,
  draft: blogs.filter(b => b.status === "draft").length,
  scheduled: blogs.filter(b => b.status === "scheduled").length,
  published: blogs.filter(b => b.status === "published").length,
};

const filteredBlogs =
  activeTab === "all"
    ? blogs
    : blogs.filter((blog) => blog.status === activeTab);

  const previewImageSrc =
    imagePreview ||
    (typeof formData.coverImage === "string"
      ? formData.coverImage
      : null);

  return (
    <div className="pt-20 lg:pl-[17rem] px-6 py-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-blue-50 via-white to-orange-50 border shadow-sm flex flex-col lg:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Blogs</h1>
          <p className="text-sm text-gray-600">
            Create, manage, schedule and publish blog content
          </p>
        </div>

        {/* CREATE BLOG BUTTON (UI ONLY) */}
<button
onClick={() => {
  setEditorOpen(true);
  setPreviewMode(false);
  setScheduleMode(false);
  setEditingBlogId(null);
  setImagePreview(null);
  setImageFile(null);
}}

  className="self-start lg:self-center px-5 py-2 rounded-lg text-sm font-semibold
             bg-gradient-to-r from-orange-500 to-blue-500
             text-white shadow hover:opacity-90 transition"
>
  + Create Blog
</button>

      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
{[
  { label: "Total Blogs", value: stats.total },
  { label: "Drafts", value: stats.draft },
  { label: "Scheduled", value: stats.scheduled },
  { label: "Published", value: stats.published },
].map((stat, idx) => (
          <div
            key={idx}
            className="rounded-xl p-5 border bg-gradient-to-br from-blue-50 via-white to-orange-50 shadow-sm"
          >
            <p className="text-sm text-gray-600">{stat.label}</p>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">
              {stat.value}
            </h2>
          </div>
        ))}
      </div>

      {/* ================= STATUS TABS ================= */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition
              ${
                activeTab === tab
                  ? "bg-gradient-to-r from-orange-500 to-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= TABLE ================= */}
      <div className="rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-orange-50 shadow-sm overflow-x-auto">
        <table className="min-w-full text-sm">
      <thead className="bg-white/70 backdrop-blur text-gray-700 border-b">
                <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Views</th>
              <th className="px-4 py-3">Read Time</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
<tbody>
  {/* LOADING STATE */}
  {loading && (
    <tr>
      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
        Loading blogs...
      </td>
    </tr>
  )}

  {/* EMPTY STATE */}
  {!loading && filteredBlogs.length === 0 && (
    <tr>
      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
        No blogs found
      </td>
    </tr>
  )}

  {/* BLOG ROWS */}
  {!loading &&
    filteredBlogs.map((blog) => (
      <tr
        key={blog._id}
        className="border-t hover:bg-blue-50/40 transition"
      >
        <td className="px-4 py-3 font-medium text-gray-800">
          {blog.title}
        </td>

        <td className="px-4 py-3 text-center text-gray-800">
          {blog.category || "-"}
        </td>

        <td className="px-4 py-3 text-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold
              ${
                blog.status === "published"
                  ? "bg-green-100 text-green-700"
                  : blog.status === "draft"
                  ? "bg-gray-200 text-gray-700"
                  : blog.status === "scheduled"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
          >
            {blog.status.toUpperCase()}
          </span>
        </td>

        <td className="px-4 py-3 text-center text-gray-800">
          {blog.views ?? 0}
        </td>

        <td className="px-4 py-3 text-center text-gray-800">
          {blog.readTime ? `${blog.readTime} min` : "-"}
        </td>

<td className="px-4 py-3 text-center space-x-3">
<button
  onClick={() => handleEditClick(blog)}
 className="text-sm font-medium text-blue-600 hover:text-blue-700"

>
  Edit
</button>

  {blog.status !== "published" ? (
    <button
      onClick={() => handlePublish(blog._id)}
      className="text-green-700 hover:underline text-sm"
    >
      Publish
    </button>
  ) : (
    <button
      onClick={() => handleUnpublish(blog._id)}
      className="text-orange-600 hover:underline text-sm"
    >
      Unpublish
    </button>
  )}
</td>

      </tr>
    ))}
</tbody>

        </table>
      </div>

{/* ================= BLOG EDITOR MODAL ================= */}
<div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

{editorOpen && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">

    {/* ===== MODAL BOX ===== */}
    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl
                    max-h-[85vh] flex flex-col">

      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">
          {editingBlogId ? "Edit Blog" : "Create Blog"}
        </h2>

        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          {previewMode ? "Back to Edit" : "Preview"}
        </button>
      </div>

      {/* ===== BODY (SCROLLABLE) ===== */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

        {!previewMode ? (
  <>
    <input
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="Blog Title"
      className="w-full border border-gray-400 focus:ring-blue-400 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />

    <input
      name="category"
      value={formData.category}
      onChange={handleChange}
      placeholder="Category"
      className="w-full border border-gray-400 focus:ring-blue-400 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />

    <input
      name="tags"
      value={formData.tags}
      onChange={handleChange}
      placeholder="Tags (comma separated)"
      className="w-full border border-gray-400 focus:ring-blue-400 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />

<label className="block">
  <span className="text-sm font-medium text-gray-700">
    Cover Image
  </span>

  <input
    type="file"
    accept="image/*"
    onChange={handleImageChange}
    className="mt-1 block w-full text-sm text-gray-700
               file:mr-4 file:py-2 file:px-4
               file:rounded-lg file:border-0
               file:text-sm file:font-semibold
               file:bg-gradient-to-r file:from-orange-500 file:to-blue-500
               file:text-white hover:file:opacity-90"
  />
</label>

{previewImageSrc && (
  <img
    src={
      previewImageSrc.startsWith("data:")
        ? previewImageSrc
        : `${import.meta.env.VITE_API_BASE_URL}${previewImageSrc}`
    }
    alt="Cover preview"
    className="w-full h-64 object-cover rounded-xl mb-4"
  />
)}



    <textarea
      name="excerpt"
      value={formData.excerpt}
      onChange={handleChange}
      placeholder="Short excerpt"
      rows={2}
      className="w-full border border-gray-400 focus:ring-blue-400 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />

    <textarea
      name="content"
      value={formData.content}
      onChange={handleChange}
      placeholder="Write blog content here..."
      rows={6}
      className="w-full border border-gray-400 focus:ring-blue-400 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />
  </>
) : (
  <div className="prose max-w-none prose-gray text-gray-800">


        {/* 🔥 COVER IMAGE PREVIEW — ADD THIS */}
{previewImageSrc && (
  <img
    src={
      previewImageSrc.startsWith("data:")
        ? previewImageSrc
        : `${import.meta.env.VITE_API_BASE_URL}${previewImageSrc}`
    }
    alt="Cover preview"
    className="w-full h-64 object-cover rounded-xl mb-4"
  />
)}


    <h1>{formData.title || "Untitled Blog"}</h1>

    {formData.category && (
      <p className="text-sm text-gray-500">
        Category: {formData.category}
      </p>
    )}

    {formData.excerpt && (
      <p className="italic text-gray-600">{formData.excerpt}</p>
    )}

    <hr />

    <div className="whitespace-pre-wrap">
      {formData.content || "No content written yet."}
    </div>
  </div>
)}
{/* ================= SCHEDULE SECTION ================= */}
<div className="border-t pt-4">
  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
    <input
      type="checkbox"
      checked={scheduleMode}
      onChange={(e) => setScheduleMode(e.target.checked)}
    />
    Schedule publishing
  </label>

  {scheduleMode && (
    <input
      type="datetime-local"
      name="publishAt"
      value={formData.publishAt}
      onChange={handleChange}
      className="mt-2 w-full border border-gray-400 focus:ring-blue-400 rounded-lg px-4 py-2
                 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  )}
</div>


      </div>

      {/* ===== FOOTER ===== */}
      <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white">
        <button
          onClick={() => setEditorOpen(false)}
          className="px-4 py-2 rounded-lg border border-gray-400 focus:ring-blue-400
                     text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>

        <button
          disabled={previewMode}
          onClick={editingBlogId ? handleUpdateBlog : handleCreateBlog}
          className={`px-5 py-2 rounded-lg text-white font-semibold
            bg-gradient-to-r from-orange-500 to-blue-500
            ${previewMode ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"}`}
        >
          {editingBlogId
            ? scheduleMode
              ? "Update Schedule"
              : "Update"
            : scheduleMode
            ? "Schedule"
            : "Create"}
        </button>
      </div>

    </div>
  </div>
)}


</div>
    </div>
  );
};

export default BlogDashboard;
