import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

const PmKusumDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [previewLead, setPreviewLead] = useState(null);

  /* ================= FETCH ================= */
  const fetchPMKusumLeads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/pm-kusum`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLeads(res.data || []);
    } catch (err) {
      console.error("Failed to load PM KUSUM leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPMKusumLeads();
  }, []);

  /* ================= CREATE / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);

    const payload = {
      serialNumber: Number(form.get("serialNumber")),
      name: form.get("name"),
      phone: form.get("phone"),
      megawattRequirement: Number(form.get("megawattRequirement")),
      district: form.get("district"),
      village: form.get("village"),
      landAddress: form.get("landAddress"),
      status: form.get("status"),
    };

    try {
      if (editingLead) {
        await axios.put(
          `${API}/api/pm-kusum/${editingLead._id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
      } else {
        await axios.post(`${API}/api/pm-kusum`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      setShowForm(false);
      setEditingLead(null);
      fetchPMKusumLeads();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this PM KUSUM lead?")) return;

    try {
      await axios.delete(`${API}/api/pm-kusum/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchPMKusumLeads();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* ================= UI ================= */
  return (
    <main className="pt-20 lg:pl-64 min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              PM KUSUM Leads
            </h1>
            <p className="text-sm text-gray-600">
              Government scheme based solar leads
            </p>
          </div>

          <button
            onClick={() => {
              setEditingLead(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg
              bg-gradient-to-r from-blue-600 to-orange-500
              text-white text-sm font-medium shadow hover:opacity-90"
          >
            <Plus size={16} />
            Add Lead
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto rounded-xl border border-gray-200 text-left
          bg-gradient-to-br from-blue-50 via-white to-orange-50">

          <table className="min-w-full text-sm">
            <thead className="bg-white/70 border-b border-gray-200 text-gray-600">
              <tr >
                <th className="px-4 py-3">S.No</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">MW Req.</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Village</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-600">
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-gray-600">
                    No PM KUSUM leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead._id}
                    className="border-b border-gray-100 hover:bg-white/60 transition"
                  >
                    <td className="px-4 py-3 text-gray-900">
                      {lead.serialNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-800">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-800">
                      {lead.megawattRequirement}
                    </td>
                    <td className="px-4 py-3 text-gray-800">{lead.district}</td>
                    <td className="px-4 py-3 text-gray-800">{lead.village}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            lead.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => {
                          setPreviewLead(lead);
                          setShowPreview(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLead(lead);
                          setShowForm(true);
                        }}
                        className="text-orange-600 hover:text-orange-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(lead._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
<form
  onSubmit={handleSubmit}
  className="
    w-full max-w-xl
    bg-white rounded-xl
    p-6 space-y-4
    max-h-[90vh]
    overflow-y-auto
  "
>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingLead ? "Edit PM KUSUM Lead" : "Add PM KUSUM Lead"}
            </h2>

            {[
              ["serialNumber", "Serial Number", "number"],
              ["name", "Name", "text"],
              ["phone", "Phone", "text"],
              ["megawattRequirement", "Megawatt Requirement", "number"],
              ["district", "District", "text"],
              ["village", "Village", "text"],
            ].map(([name, label, type]) => (
              <div key={name}>
                <label className="text-sm text-gray-600">{label}</label>
                <input
                  name={name}
                  type={type}
                  defaultValue={editingLead?.[name] || ""}
                  required
                  className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
                />
              </div>
            ))}

            <div>
              <label className="text-sm text-gray-600">Land Address</label>
              <textarea
                name="landAddress"
                defaultValue={editingLead?.landAddress || ""}
                required
                className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Status</label>
              <select
                name="status"
                defaultValue={editingLead?.status || "active"}
                className="w-full mt-1 px-3 py-2 border rounded-lg text-gray-900"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingLead(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {showPreview && previewLead && (
<div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto">
  <div className="min-h-full flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl p-6 space-y-3">
            <h2 className="text-lg font-semibold text-gray-900">
              PM KUSUM Lead Details
            </h2>

            {Object.entries({
              "Serial Number": previewLead.serialNumber,
              Name: previewLead.name,
              Phone: previewLead.phone,
              "Megawatt Requirement": previewLead.megawattRequirement,
              District: previewLead.district,
              Village: previewLead.village,
              Status: previewLead.status,
            }).map(([label, value]) => (
              <p key={label} className="text-sm text-gray-800">
                <span className="font-medium text-gray-600">{label}:</span>{" "}
                {value}
              </p>
            ))}

            <div>
              <p className="text-sm font-medium text-gray-600">
                Land Address
              </p>
              <p className="text-sm text-gray-800">
                {previewLead.landAddress}
              </p>
            </div>

            <div className="text-right pt-4">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
         </div>
      )}
     
        
    </main>
  );
};

export default PmKusumDashboard;
