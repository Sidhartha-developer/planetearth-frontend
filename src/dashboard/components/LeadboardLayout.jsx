import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  X,
  Edit2,
  Trash2,
  Plus,
  Upload,
  Users,
  Target,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Calendar,
  FileText,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  bulkUpdateLeads,
  createLead,
  deleteLead,
  getAllLeads,
  getAllStaff,
  updateLead,
} from "../../api/leadapi";
import { useSelector } from "react-redux";

const LeadboardLayout = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [staff, setStaff] = useState([]);
  const [selectedLeadType, setSelectedLeadType] = useState("water");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({
    show: false,
    leadId: null,
    leadName: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    assignedTo: "",
    leadStatus: "",
    limit: 10,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

const initialFormData = {
  name: "",
  contact: "",
  assignedTo: "",
  location: "",
  locationLink: "",
  scheduleVisit: "",
  stage: "new",
  leadType: "water",   // ✅ SAFE DEFAULT
  requiredKW: "",
  moveToInstallation: false,
};

const [formData, setFormData] = useState(initialFormData);

useEffect(() => {
  setFormData((prev) => ({
    ...prev,
    leadType: selectedLeadType,
    requiredKW: selectedLeadType === "solar" ? prev.requiredKW : "",
  }));
}, [selectedLeadType]);



  const [bulkData, setBulkData] = useState("");
const [showDetailsModal, setShowDetailsModal] = useState({
  show: false,
  title: "",
  content: ""
});
  // Fetch staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const data = await getAllStaff(token);
        setStaff(data.data);
      } catch (err) {
        setError(err.message || "Failed to load staff");
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [token]);

  // Fetch leads
const fetchLeads = async () => {
  try {
    setLoading(true);
    setError("");
    const params = {
      page: currentPage,
      limit: filters.limit,
      leadType: selectedLeadType, 
      ...(filters.search && { search: filters.search }),
      ...(filters.assignedTo && { assignedTo: filters.assignedTo }),
      ...(filters.stage && { stage: filters.stage }),
      ...(filters.leadStatus && { leadStatus: filters.leadStatus }), // 👈 ADD THIS
    };

    const response = await getAllLeads(token, params);
    setLeads(response.data);
    setTotalLeads(response.total);
    setTotalPages(Math.ceil(response.total / filters.limit));
  } catch (err) {
    setError(err.message || "Failed to fetch leads");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchLeads();
  }, [currentPage, filters, selectedLeadType]);

  // Filter leads based on active tab
  const filteredLeads = leads.filter((lead) => {
    if (activeTab === "all") return true;
    if (activeTab === "new") return lead.stage === "new";
    if (activeTab === "scheduled") return lead.stage === "scheduled";
    if (activeTab === "finished") return lead.stage === "finished";
    return true;
  });

  // Handle create lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await createLead(formData, token);
      setSuccess("Lead created successfully");
      setShowAddModal(false);
      resetForm();
      fetchLeads();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create lead");
    } finally {
      setLoading(false);
    }
  };


const handleUpdateLead = async (e) => {
  e.preventDefault();
  
  // ADD THIS VALIDATION
  if (formData.moveToInstallation && formData.stage !== 'finished') {
    setError('Only finished leads can be moved to installation');
    return;
  }
  
  try {
    setLoading(true);
    setError("");
    await updateLead(selectedLead._id, formData, token); // formData already includes moveToInstallation
    setSuccess("Lead updated successfully");
    setShowEditModal(false);
    resetForm();
    fetchLeads();
    setTimeout(() => setSuccess(""), 3000);
  } catch (err) {
    setError(err.message || "Failed to update lead");
  } finally {
    setLoading(false);
  }
};

  const handleDeleteLead = async () => {
    const { leadId } = deleteConfirmModal;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await deleteLead(leadId, token);

      setSuccess("Lead deleted successfully");
      setDeleteConfirmModal({ show: false, leadId: null, leadName: "" });

      await fetchLeads();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      const errorMessage =
        err.message || err.error || "Failed to delete lead. Please try again.";
      setError(errorMessage);
      setTimeout(() => setError(""), 5000);
      console.error("Delete lead error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk update
  const handleBulkUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      const leadsArray = JSON.parse(bulkData);
      const response = await bulkUpdateLeads(leadsArray, token);
      setSuccess(
        `Bulk operation completed. ${response.results.length} leads processed`
      );
      setShowBulkModal(false);
      setBulkData("");
      fetchLeads();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.message || "Failed to process bulk update. Check JSON format."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal
  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name || "",
      contact: lead.contact || "",
      assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
      location: lead.location || "",
      locationLink: lead.locationLink || "",
      scheduleVisit: lead.scheduleVisit
        ? new Date(lead.scheduleVisit).toISOString().slice(0, 16)
        : "",
      stage: lead.stage || "new",
      leadType: lead.leadType || "water",
      requiredKW: lead.requiredKW || "",
      moveToInstallation: lead.moveToInstallation || false, // ADD THIS
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      contact: "",
      assignedTo: "",
      location: "",
      locationLink: "",
      scheduleVisit: "",
      stage: "new",
      moveToInstallation: false, 
    });
    setSelectedLead(null);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: "",
      assignedTo: "",
     leadStatus: "", 
      limit: 10,
    });
    setCurrentPage(1);
  };

  // Get stage configuration
  const getStageConfig = (stage) => {
    const configs = {
      new: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-300",
        icon: Target,
      },
      scheduled: {
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-300",
        icon: Clock,
      },
      finished: {
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-300",
        icon: CheckCircle,
      },
    };
    return configs[stage] || configs.new;
  };

  // Stats
  const stats = [
    {
      label: "Total Leads",
      value: totalLeads,
      icon: FileText,
      color: "text-slate-600",
    },
    {
      label: "New",
      value: leads.filter((l) => l.stage === "new").length,
      icon: Target,
      color: "text-blue-600",
    },
    {
      label: "Scheduled",
      value: leads.filter((l) => l.stage === "scheduled").length,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Finished",
      value: leads.filter((l) => l.stage === "finished").length,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
    label: "Hot Leads",
    value: leads.filter((l) => l.finished?.leadStatus === "Hot").length,
    icon: Target,
    color: "text-red-600",
  },
  {
    label: "Warm Leads",
    value: leads.filter((l) => l.finished?.leadStatus === "Warm").length,
    icon: Target,
    color: "text-orange-600",
  },
  {
    label: "Cold Leads",
    value: leads.filter((l) => l.finished?.leadStatus === "Cold").length,
    icon: Target,
    color: "text-blue-400",
  },
  ];

  return (
<div
  className={`min-h-screen lg:pl-64 mt-16 transition-colors duration-700
    ${
      selectedLeadType === "water"
        ? "bg-gradient-to-br from-blue-200 via-blue-50 to-cyan-200"
        : "bg-gradient-to-br from-orange-200 via-orange-50 to-yellow-200"
    }`}
>
      {/* Header */}
{/* Admin Welcome Bar */}
<div
  className={`border-b shadow-sm mb-8 transition-colors duration-500
    ${
      selectedLeadType === "water"
        ? "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 border-blue-300"
        : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 border-orange-300"
    }`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

      {/* Left text */}
      <div>
        <h1 className="text-2xl font-semibold text-white">
          Welcome back, {user?.name || "Admin"} 👋
        </h1>
        <p className="text-sm text-white/80 mt-1">
          Manage all leads and team assignments
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">

        {/* Bulk Upload */}
        <button
          onClick={() => setShowBulkModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium
                     bg-white/20 backdrop-blur-md text-white
                     hover:bg-white/30 transition-all"
        >
          <Upload className="w-4 h-4" />
          Bulk Upload
        </button>

        {/* Add Lead */}
        <button
          onClick={() => setShowAddModal(true)}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-semibold
            transition-all
            ${
              selectedLeadType === "water"
                ? "bg-white text-blue-700 hover:bg-blue-50"
                : "bg-white text-orange-700 hover:bg-orange-50"
            }`}
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </button>

      </div>
    </div>
  </div>
</div>


{/* Water / Solar Toggle */}
<div className="flex justify-center my-12">
  <div className="relative w-[380px] h-[76px] bg-white/70 backdrop-blur-xl border border-white/40 rounded-full shadow-xl overflow-hidden">

    {/* Animated Glow Slider */}
    <div
      className={`absolute top-1 left-1 h-[68px] w-[180px] rounded-full transition-all duration-500 ease-out
        ${
          selectedLeadType === "water"
            ? "translate-x-0 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 shadow-[0_0_35px_rgba(59,130,246,0.65)]"
            : "translate-x-[190px] bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 shadow-[0_0_35px_rgba(251,146,60,0.65)]"
        }`}
    />

    {/* Inner subtle pulse */}
    <div
      className={`absolute inset-0 rounded-full pointer-events-none
        ${
          selectedLeadType === "water"
            ? "animate-pulse bg-blue-400/10"
            : "animate-pulse bg-orange-400/10"
        }`}
    />

    {/* Buttons */}
    <div className="relative z-10 flex h-full">
      {/* Water */}
      <button
        onClick={() => setSelectedLeadType("water")}
        className={`w-1/2 flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300
          ${
            selectedLeadType === "water"
              ? "text-white scale-105"
              : "text-gray-500 hover:text-blue-600"
          }`}
      >
        💧 Water
      </button>

      {/* Solar */}
      <button
        onClick={() => setSelectedLeadType("solar")}
        className={`w-1/2 flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300
          ${
            selectedLeadType === "solar"
              ? "text-white scale-105"
              : "text-gray-500 hover:text-orange-500"
          }`}
      >
        🌞 Solar
      </button>
    </div>
  </div>
</div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alerts */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Stats Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {stats.map((stat, idx) => {
    const Icon = stat.icon;

    const isWater = selectedLeadType === "water";

    return (
      <div
        key={idx}
        className={`relative rounded-xl p-5 transition-all duration-300 cursor-default
          ${
            isWater
              ? "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 shadow-[0_10px_30px_rgba(59,130,246,0.45)] hover:shadow-[0_15px_40px_rgba(59,130,246,0.6)]"
              : "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-400 shadow-[0_10px_30px_rgba(251,146,60,0.45)] hover:shadow-[0_15px_40px_rgba(251,146,60,0.6)]"
          } hover:-translate-y-1`}
      >
        {/* Soft Glow Overlay */}
        <div className="absolute inset-0 rounded-xl bg-white/5 pointer-events-none" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">
              {stat.label}
            </p>
            <h3 className="text-3xl font-semibold text-white mt-1">
              {stat.value}
            </h3>
          </div>

          <div
            className={`p-3 rounded-lg
              ${
                isWater
                  ? "bg-white/20 text-white"
                  : "bg-white/20 text-white"
              }`}
          >
            <Icon className="w-7 h-7" />
          </div>
        </div>
      </div>
    );
  })}
</div>


{/* Lead Tabs */}
<div className="rounded-xl mb-6 overflow-hidden shadow-sm">
  <div
    className={`flex border-b transition-colors duration-300
      ${
        selectedLeadType === "water"
          ? "bg-white/70 backdrop-blur border-blue-200"
          : "bg-white/70 backdrop-blur border-orange-200"
      }`}
  >
    {[
      { key: "all", label: "All Leads", count: totalLeads },
      {
        key: "new",
        label: "New",
        count: leads.filter((l) => l.stage === "new").length,
      },
      {
        key: "scheduled",
        label: "Scheduled",
        count: leads.filter((l) => l.stage === "scheduled").length,
      },
      {
        key: "finished",
        label: "Finished",
        count: leads.filter((l) => l.stage === "finished").length,
      },
    ].map((tab) => (
      <button
        key={tab.key}
        onClick={() => setActiveTab(tab.key)}
        className={`relative px-6 py-4 text-sm font-semibold transition-all duration-300
          ${
            activeTab === tab.key
              ? selectedLeadType === "water"
                ? "text-blue-700"
                : "text-orange-700"
              : "text-gray-600 hover:text-gray-900"
          }`}
      >
        {/* Active underline */}
        {activeTab === tab.key && (
          <span
            className={`absolute left-0 bottom-0 h-[3px] w-full rounded-full
              ${
                selectedLeadType === "water"
                  ? "bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.6)]"
                  : "bg-gradient-to-r from-orange-400 to-yellow-400 shadow-[0_0_10px_rgba(251,146,60,0.6)]"
              }`}
          />
        )}

        {tab.label} ({tab.count})
      </button>
    ))}
  </div>
</div>


        {/* Filters */}
{/* Filters */}
<div
  className={`rounded-xl p-5 mb-6 shadow-sm transition-colors duration-300
    ${
      selectedLeadType === "water"
        ? "bg-white/70 backdrop-blur border border-blue-200"
        : "bg-white/70 backdrop-blur border border-orange-200"
    }`}
>
  <div className="flex items-center gap-2 mb-4">
    <Filter
      className={`w-5 h-5 ${
        selectedLeadType === "water" ? "text-blue-600" : "text-orange-600"
      }`}
    />
    <h2
      className={`text-base font-semibold ${
        selectedLeadType === "water" ? "text-blue-700" : "text-orange-700"
      }`}
    >
      Filters
    </h2>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
    {/* Search */}
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        type="text"
        name="search"
        placeholder="Search leads..."
        value={filters.search}
        onChange={handleFilterChange}
        className={`w-full pl-9 pr-3 py-2 text-sm
  text-gray-900 placeholder-gray-500
  bg-white
  rounded-lg border
  focus:outline-none transition
  ${
    selectedLeadType === "water"
      ? "border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
      : "border-orange-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
  }`}

      />
    </div>

    {/* Assigned To */}
    <select
      name="assignedTo"
      value={filters.assignedTo}
      onChange={handleFilterChange}
      className={`px-3 py-2 text-sm
  text-gray-900 bg-white
  rounded-lg border
  focus:outline-none transition
        ${
          selectedLeadType === "water"
            ? "border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            : "border-orange-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
        }`}
    >
      <option value="">All Staff</option>
      {staff.map((member) => (
        <option key={member._id} value={member._id}>
          {member.name}
        </option>
      ))}
    </select>

    {/* Lead Status */}
    <select
      name="leadStatus"
      value={filters.leadStatus}
      onChange={handleFilterChange}
      className={`px-3 py-2 text-sm
  text-gray-900 bg-white
  rounded-lg border
  focus:outline-none transition
        ${
          selectedLeadType === "water"
            ? "border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            : "border-orange-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
        }`}
    >
      <option value="">All Lead Status</option>
      <option value="Hot">Hot</option>
      <option value="Warm">Warm</option>
      <option value="Cold">Cold</option>
    </select>

    {/* Limit */}
    <select
      name="limit"
      value={filters.limit}
      onChange={handleFilterChange}
      className={`px-3 py-2 text-sm
  text-gray-900 bg-white
  rounded-lg border
  focus:outline-none transition
        ${
          selectedLeadType === "water"
            ? "border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            : "border-orange-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
        }`}
    >
      <option value="10">10 per page</option>
      <option value="25">25 per page</option>
      <option value="50">50 per page</option>
      <option value="100">100 per page</option>
    </select>

    {/* Clear */}
    <button
      onClick={clearFilters}
      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg font-medium transition
        ${
          selectedLeadType === "water"
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "bg-orange-50 text-orange-700 hover:bg-orange-100"
        }`}
    >
      <X className="w-4 h-4" />
      Clear
    </button>
  </div>
</div>

        {/* Leads Table */}
<div
  className={`rounded-xl overflow-hidden mb-6 shadow-sm transition-colors
    ${
      selectedLeadType === "water"
        ? "bg-white/70 backdrop-blur border border-blue-200"
        : "bg-white/70 backdrop-blur border border-orange-200"
    }`}
>          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin mb-3">
                <Target className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">Loading leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                No leads found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first lead to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-semibold transition
  ${
    selectedLeadType === "water"
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-orange-500 hover:bg-orange-600 text-white"
  }`}

              >
                <Plus className="w-4 h-4" />
                Add Lead
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead
  className={`border-b text-xs uppercase
    ${
      selectedLeadType === "water"
        ? "bg-blue-50 border-blue-200 text-blue-800"
        : "bg-orange-50 border-orange-200 text-orange-800"
    }`}
>

                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
  Sl.No
</th>

                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Location
                    </th>
                    
                    {activeTab === "all" && (
      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
        Lead Status
      </th>
    )}

                    {activeTab === "scheduled" && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Visit Date
                      </th>
                    )}
                    {activeTab === "finished" && (
                      <>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Lead Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Quote
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Suggested Products
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
      Notes
    </th>
                      
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map((lead) => {
                    const stageConfig = getStageConfig(lead.stage);
                    const StageIcon = stageConfig.icon;
                    return (
                      <tr
                        key={lead._id}
                        className={`transition-colors
  ${
    selectedLeadType === "water"
      ? "hover:bg-blue-50/60"
      : "hover:bg-orange-50/60"
  }`}

                      >
                        <td className="px-6 py-4">
  <div className="text-sm font-medium text-gray-700">
    {(currentPage - 1) * filters.limit + filteredLeads.indexOf(lead) + 1}
  </div>
</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                        </td>
                                              <td className="px-6 py-4">
                                                   {lead.contact ? (
                                                    <a
                         href={`https://wa.me/91${lead.contact.replace(/\D/g, '')}?text=Hello ${encodeURIComponent(lead.name)}`}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-small"
                       >
                         <Phone className="w-4 h-4" />
                         {lead.contact}
                       </a>
                       
                                                   ) : (
                                                     <span className="text-gray-400">—</span>
                                                   )}
                                                 </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium">
                              {lead.assignedTo?.name || "Unassigned"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {lead.location || "—"}
                            </span>
                            {lead.locationLink && (
                              <a
                                href={lead.locationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                title="Open in Maps"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                        {activeTab === "all" && (
          <td className="px-6 py-4">
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                lead.finished?.leadStatus === "Hot"
                  ? "bg-red-100 text-red-700"
                  : lead.finished?.leadStatus === "Warm"
                  ? "bg-orange-100 text-orange-700"
                  : lead.finished?.leadStatus === "Cold"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {lead.finished?.leadStatus || "—"}
            </span>
          </td>
        )}

                        {activeTab === "scheduled" && (
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {lead.scheduleVisit
                                ? new Date(lead.scheduleVisit).toLocaleString()
                                : "—"}
                            </div>
                          </td>
                        )}
                      {activeTab === "finished" && (
  <>
    <td className="px-6 py-4">
      <span
        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          lead.finished?.leadStatus === "Hot"
            ? "bg-red-100 text-red-700"
            : lead.finished?.leadStatus === "Warm"
            ? "bg-orange-100 text-orange-700"
            : lead.finished?.leadStatus === "Cold"
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-700"
        }`}
      >
        {lead.finished?.leadStatus || "—"}
      </span>
    </td>
    <td className="px-6 py-4">
      <span
        className={`text-sm font-medium ${
          lead.finished?.quoteSent
            ? "text-green-600"
            : "text-gray-400"
        }`}
      >
        {lead.finished?.quoteSent ? "Sent" : "Not Sent"}
      </span>
    </td>
    <td className="px-6 py-4">
      {lead.finished?.suggestedProducts ? (
        <button
          onClick={() => setShowDetailsModal({
            show: true,
            title: "Suggested Products",
            content: lead.finished.suggestedProducts
          })}
          className="text-sm text-blue-600 hover:text-blue-700 underline text-left line-clamp-2"
          title="Click to view full details"
        >
          {lead.finished.suggestedProducts}
        </button>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>
    <td className="px-6 py-4">
      {lead.finished?.notes ? (
        <button
          onClick={() => setShowDetailsModal({
            show: true,
            title: "Notes",
            content: lead.finished.notes
          })}
          className="text-sm text-blue-600 hover:text-blue-700 underline text-left line-clamp-2"
          title="Click to view full details"
        >
          {lead.finished.notes}
        </button>
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </td>
  </>
)}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${stageConfig.bg} ${stageConfig.text} border ${stageConfig.border}`}
                          >
                            <StageIcon className="w-3.5 h-3.5" />
                            {lead.stage}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(lead)}
                              className={`p-2 rounded-md transition-colors
  ${
    selectedLeadType === "water"
      ? "hover:bg-blue-100 text-blue-600"
      : "hover:bg-orange-100 text-orange-600"
  }`}

                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteConfirmModal({
                                  show: true,
                                  leadId: lead._id,
                                  leadName: lead.name,
                                })
                              }
                              className="p-2 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-white border border-gray-200 rounded-lg">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page <span className="font-semibold">{currentPage}</span> of{" "}
              {totalPages}
              <span className="text-gray-500 ml-2">({totalLeads} total)</span>
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Add New Lead
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateLead} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Lead Name / Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter lead or company name"
                    className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500
                              border border-gray-300 rounded-md
                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contact Info
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    placeholder="Phone number"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Assign To *
                  </label>
                  <select
                    required
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm text-gray-900
                               border border-gray-300 rounded-md
                                focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Staff Member</option>
                    {staff.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="City or address"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Link (Google Maps)
                  </label>
                  <input
                    type="url"
                    value={formData.locationLink}
                    onChange={(e) =>
                      setFormData({ ...formData, locationLink: e.target.value })
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Schedule Visit Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduleVisit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleVisit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
                {formData.leadType === "solar" && (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      Required Capacity (kW) *
    </label>
    <input
      type="number"
      required
      value={formData.requiredKW}
      onChange={(e) =>
        setFormData({ ...formData, requiredKW: Number(e.target.value) })
      }
      placeholder="e.g. 5"
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
    />
  </div>
)}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Lead"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Lead Modal */}
        {showEditModal && (
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Edit Lead
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateLead} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Lead Name / Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white
                    border border-gray-300 rounded-md
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contact Info
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) =>
                      setFormData({ ...formData, contact: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm text-gray-900
           border border-gray-300 rounded-md
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Assign To *
                  </label>
                  <select
                    required
                    value={formData.assignedTo}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedTo: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm text-gray-900
           border border-gray-300 rounded-md
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Staff Member</option>
                    {staff.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm text-gray-900
           border border-gray-300 rounded-md
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Location Link (Google Maps)
                  </label>
                  <input
                    type="url"
                    value={formData.locationLink}
                    onChange={(e) =>
                      setFormData({ ...formData, locationLink: e.target.value })
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 text-sm text-gray-900
           border border-gray-300 rounded-md
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Schedule Visit Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduleVisit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scheduleVisit: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm text-gray-900
           border border-gray-300 rounded-md
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Stage
                  </label>
                  <select
                    value={formData.stage}
                    onChange={(e) =>
                      setFormData({ ...formData, stage: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm text-gray-900
           border border-gray-300 rounded-md
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="new">New</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Updating..." : "Update Lead"}
                  </button>
                </div>
                <div className="col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={formData.moveToInstallation}
        onChange={(e) => setFormData({ ...formData, moveToInstallation: e.target.checked })}
        disabled={selectedLead?.moveToInstallation}
        className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
      />
      <div>
        <span className="text-sm font-semibold text-gray-900">
          Move to Installation Pipeline
        </span>
        <p className="text-xs text-gray-600 mt-1">
          Check this to automatically create an installation entry for this finished lead
        </p>
        {selectedLead?.moveToInstallation && (
          <p className="text-xs text-green-600 font-medium mt-1">
            ✓ Already moved to installation
          </p>
        )}
      </div>
    </label>
  </div>
              </form>
            </div>
            
          </div>
          
        )}
        

        {/* Bulk Upload Modal */}
        {showBulkModal && (
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkModal(false)}
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Bulk Upload/Update Leads
                </h2>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkUpdate} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON Data
                  </label>
                  <textarea
                    rows="12"
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    placeholder={`[\n  {\n    "name": "John Doe Company",\n    "contact": "9876543210",\n    "assignedTo": "staff_id_here",\n    "location": "Bangalore",\n    "locationLink": "https://maps.google.com/...",\n    "scheduleVisit": "2025-10-30T10:00",\n    "stage": "new"\n  }\n]`}
                    className="w-full border border-gray-300 rounded-md p-3 text-sm font-mono text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste JSON array of leads. Include{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded">_id</code>{" "}
                    for updates, omit for new leads.
                  </p>
                </div>
                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Processing..." : "Process Bulk Operation"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {deleteConfirmModal.show && (
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
            onClick={() =>
              setDeleteConfirmModal({ show: false, leadId: null, leadName: "" })
            }
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Lead
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-medium text-gray-900">
                    {deleteConfirmModal.leadName}
                  </span>
                  ? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setDeleteConfirmModal({
                        show: false,
                        leadId: null,
                        leadName: "",
                      })
                    }
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteLead}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
{showDetailsModal.show && (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    onClick={() => setShowDetailsModal({ show: false, title: "", content: "" })}
  >
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto transform transition-all scale-100 animate-fadeIn"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 tracking-tight">
          {showDetailsModal.title}
        </h3>
        <button
          onClick={() => setShowDetailsModal({ show: false, title: "", content: "" })}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
          {showDetailsModal.content}
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-end p-5 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button
          onClick={() => setShowDetailsModal({ show: false, title: "", content: "" })}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default LeadboardLayout;
