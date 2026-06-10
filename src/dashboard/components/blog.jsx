{!previewMode ? (
  <>
    <input
      name="title"
      value={formData.title}
      onChange={handleChange}
      placeholder="Blog Title"
      className="w-full border border-gray-300 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />

    <input
      name="category"
      value={formData.category}
      onChange={handleChange}
      placeholder="Category"
      className="w-full border border-gray-300 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />

    <input
      name="tags"
      value={formData.tags}
      onChange={handleChange}
      placeholder="Tags (comma separated)"
      className="w-full border border-gray-300 rounded-lg px-4 py-2
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

{formData.coverImage && (
  <div className="mt-3">
    <img
      src={URL.createObjectURL(formData.coverImage)}
      alt="Cover preview"
      className="w-full max-h-48 object-cover rounded-lg border"
    />
  </div>
)}



    <textarea
      name="excerpt"
      value={formData.excerpt}
      onChange={handleChange}
      placeholder="Short excerpt"
      rows={2}
      className="w-full border border-gray-300 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />

    <textarea
      name="content"
      value={formData.content}
      onChange={handleChange}
      placeholder="Write blog content here..."
      rows={6}
      className="w-full border border-gray-300 rounded-lg px-4 py-2
                 text-gray-800 placeholder-gray-400 focus:outline-none
                 focus:ring-2 focus:ring-orange-400"
    />
  </>
) : (
  <div className="prose max-w-none">

        {/* 🔥 COVER IMAGE PREVIEW — ADD THIS */}
    {formData.coverImage && (
  <img
    src={URL.createObjectURL(formData.coverImage)}
    alt="Cover"
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
      className="mt-2 w-full border border-gray-300 rounded-lg px-4 py-2
                 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
    />
  )}
</div>
