import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Plus, X, Edit2, Trash2, RefreshCw, Filter, Search, ChevronLeft, ChevronRight, MapPin, Phone, Mail, Package, ExternalLink } from 'lucide-react';
import { useSelector } from 'react-redux';
import { completeInstallation, createInstallation, deleteInstallation, getAllInstallations, updateInstallation } from '../../api/installationapi';
import { getAllProductsList } from '../../api/productapi';
import { createAMC } from '../../api/amcapi';

const InstallationDashboard = () => {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [selectedInstallationType, setSelectedInstallationType] = useState("water");
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    limit: 10
  });

  const { token } = useSelector((state) => state.auth);

  // Form states
  const [createForm, setCreateForm] = useState({
    lead: '',
    clientName: '',
    contact: '',
    email: '',
    productToInstall: '',
    dateOfInstallation: '',
    location: '',
    locationLink: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    dateOfInstallation: ''
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    scheduleVisit: ''
  });

  const [completeForm, setCompleteForm] = useState({
    completedDate: '',
    notes: '',
    installationValue: '',
    productsUsed: [],
    hasAMC: false,
    amcDetails: {
      startDate: '',
      amcType: '4-visits',
      amcValue: '',
      notes: ''
    }
  });

  useEffect(() => {
    const fetchProducts = async () => {
      if (token) {
        try {
          const response = await getAllProductsList(token);
          setProducts(response.data || []);
        } catch (err) {
          console.error('Failed to fetch products:', err);
        }
      }
    };
    fetchProducts();
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchInstallations();
    }
  }, [token, currentPage, filters]);

  const fetchInstallations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllInstallations(token);
      setInstallations(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch installations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInstallation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createInstallation(createForm, token);
      setSuccess('Installation created successfully!');
      await fetchInstallations();
      setShowCreateModal(false);
      resetCreateForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create installation');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateToInProgress = async (e) => {
    e.preventDefault();
    
    if (!editForm.dateOfInstallation) {
      setError('Please select installation date');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateInstallation(selectedInstallation._id, {
        dateOfInstallation: editForm.dateOfInstallation,
        status: 'in-progress'
      }, token);
      setSuccess('Installation moved to in-progress!');
      await fetchInstallations();
      setShowEditModal(false);
      setSelectedInstallation(null);
      setEditForm({ dateOfInstallation: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update installation');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    
    if (!rescheduleForm.scheduleVisit) {
      setError('Please select new schedule date');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Update the lead's scheduleVisit date
      await updateInstallation(selectedInstallation._id, {
        scheduleVisit: rescheduleForm.scheduleVisit
      }, token);
      
      setSuccess('Installation rescheduled successfully!');
      await fetchInstallations();
      setShowRescheduleModal(false);
      setSelectedInstallation(null);
      setRescheduleForm({ scheduleVisit: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reschedule installation');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInstallation = async (e) => {
    e.preventDefault();
    
    // Validate products
    if (!completeForm.productsUsed || completeForm.productsUsed.length === 0) {
      setError('Please add at least one product used');
      return;
    }

    // Validate all products are selected
    const hasEmptyProduct = completeForm.productsUsed.some(p => !p.product);
    if (hasEmptyProduct) {
      setError('Please select a product for all entries');
      return;
    }

    // If AMC is enabled, validate AMC fields
    if (completeForm.hasAMC) {
      if (!completeForm.amcDetails.startDate) {
        setError('AMC start date is required');
        return;
      }
      if (!completeForm.amcDetails.amcType) {
        setError('AMC type is required');
        return;
      }
      if (!completeForm.amcDetails.amcValue) {
        setError('AMC value is required');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      
      // Prepare completion data
      const completionData = {
        completedDate: completeForm.completedDate,
        dateOfInstallation: completeForm.dateOfInstallation || completeForm.completedDate,
        notes: completeForm.notes,
        installationValue: completeForm.installationValue ? Number(completeForm.installationValue) : undefined,
        productsUsed: completeForm.productsUsed.map(p => ({
          product: p.product,
          quantity: Number(p.quantity) || 1
        })),
        status: 'completed',
        hasAMC: completeForm.hasAMC
      };

      // Only include amcDetails if hasAMC is true
      if (completeForm.hasAMC) {
        completionData.amcDetails = {
          amcType: completeForm.amcDetails.amcType,
          startDate: completeForm.amcDetails.startDate,
          amcValue: Number(completeForm.amcDetails.amcValue),
          amcAmount: Number(completeForm.amcDetails.amcValue),
          paymentStatus: 'pending',
          notes: completeForm.amcDetails.notes || ''
        };
      }

      console.log('📤 Sending completion data:', JSON.stringify(completionData, null, 2));

      // Complete the installation
      const response = await updateInstallation(
        selectedInstallation._id, 
        completionData, 
        token
      );

      console.log('✅ Response:', response);

      // Show success message
      if (response?.message) {
        setSuccess(response.message);
      } else if (completeForm.hasAMC) {
        setSuccess('Installation completed successfully! Client record and AMC have been created with scheduled visits.');
      } else {
        setSuccess('Installation completed successfully! Client record has been created.');
      }
      
      await fetchInstallations();
      setShowCompleteModal(false);
      setSelectedInstallation(null);
      resetCompleteForm();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to complete installation';
      setError(errorMessage);
      console.error('❌ Error completing installation:', err);
      console.error('Error details:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteInstallation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this installation?')) return;
    
    try {
      setLoading(true);
      await deleteInstallation(id, token);
      setSuccess('Installation deleted successfully!');
      await fetchInstallations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete installation');
    } finally {
      setLoading(false);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      lead: '',
      clientName: '',
      contact: '',
      email: '',
      productToInstall: '',
      dateOfInstallation: '',
      location: '',
      locationLink: '',
      notes: ''
    });
  };

  const resetCompleteForm = () => {
    setCompleteForm({
      completedDate: '',
      notes: '',
      installationValue: '',
      productsUsed: [],
      hasAMC: false,
      amcDetails: {
        startDate: '',
        amcType: '4-visits',
        amcValue: '',
        notes: ''
      }
    });
  };

  const openEditModal = (installation) => {
    setSelectedInstallation(installation);
    setEditForm({
      dateOfInstallation: installation.dateOfInstallation 
        ? new Date(installation.dateOfInstallation).toISOString().split('T')[0] 
        : ''
    });
    setShowEditModal(true);
  };

  const openRescheduleModal = (installation) => {
    setSelectedInstallation(installation);
    setRescheduleForm({
      scheduleVisit: installation.lead?.scheduleVisit 
        ? new Date(installation.lead.scheduleVisit).toISOString().split('T')[0]
        : ''
    });
    setShowRescheduleModal(true);
  };

const addProduct = () => {
  setCompleteForm({
    ...completeForm,
    productsUsed: [...completeForm.productsUsed, { product: '', quantity: 1, unit: 'pieces' }]
  });
};


  const removeProduct = (index) => {
    const updated = completeForm.productsUsed.filter((_, i) => i !== index);
    setCompleteForm({ ...completeForm, productsUsed: updated });
  };

const updateProduct = (index, field, value) => {
  const updated = [...completeForm.productsUsed];
  updated[index][field] = value;
  setCompleteForm({ ...completeForm, productsUsed: updated });
};

  const openCompleteModal = (installation) => {
    setSelectedInstallation(installation);
    setCompleteForm({
      completedDate: new Date().toISOString().split('T')[0],
      notes: '',
      installationValue: '',
      productsUsed: [{ product: '', quantity: 1 }],
      hasAMC: false,
      amcDetails: {
        startDate: new Date().toISOString().split('T')[0],
        amcType: '4-visits',
        amcValue: '',
        notes: ''
      }
    });
    setShowCompleteModal(true);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', limit: 10 });
    setCurrentPage(1);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-300',
        icon: Clock
      },
      'in-progress': { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-300',
        icon: AlertCircle
      },
      completed: { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-300',
        icon: CheckCircle
      },
      cancelled: { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-300',
        icon: X
      }
    };
    return configs[status] || configs.pending;
  };

  // Filter installations based on active tab
const filteredInstallations = installations.filter(inst => {
  // 🔥 INSTALLATION TYPE FILTER (NEW)
  if (inst.lead?.leadType !== selectedInstallationType) return false;

  // Status tab filter
  if (activeTab !== 'all' && inst.status !== activeTab) return false;

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    return (
      inst.clientName?.toLowerCase().includes(searchLower) ||
      inst.contact?.toLowerCase().includes(searchLower) ||
      inst.location?.toLowerCase().includes(searchLower)
    );
  }

  return true;
});


  const totalPages = Math.ceil(filteredInstallations.length / filters.limit);
  const paginatedInstallations = filteredInstallations.slice(
    (currentPage - 1) * filters.limit,
    currentPage * filters.limit
  );

const stats = {
  total: filteredInstallations.length,
  pending: filteredInstallations.filter(i => i.status === 'pending').length,
  inProgress: filteredInstallations.filter(i => i.status === 'in-progress').length,
  completed: filteredInstallations.filter(i => i.status === 'completed').length,
};

  if (loading && installations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 lg:pl-64 mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading installations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64 mt-16">
      {/* Header */}
{/* Header */}
<div
  className={`border-b shadow-sm mb-8 transition-colors
    ${
      selectedInstallationType === "water"
        ? "bg-white border-blue-200"
        : "bg-white border-orange-200"
    }`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Installations
        </h1>
        <p className="text-sm mt-1 font-medium
          text-gray-700">
          {selectedInstallationType === "water"
            ? "Manage and track Water installations"
            : "Manage and track Solar installations"}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={fetchInstallations}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors font-semibold
            ${
              selectedInstallationType === "water"
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-orange-500 hover:bg-orange-600 text-white"
            }`}
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>
    </div>
  </div>

  {/* Accent strip */}
  <div
    className={`h-1 w-full
      ${
        selectedInstallationType === "water"
          ? "bg-gradient-to-r from-blue-500 to-cyan-400"
          : "bg-gradient-to-r from-orange-400 to-yellow-400"
      }`}
  />
</div>


{/* Water / Solar Toggle */}
<div className="flex justify-center my-10">
  <div className="relative w-[360px] h-[70px] bg-white/80 backdrop-blur-xl border border-white/40 rounded-full shadow-lg overflow-hidden">

    {/* Sliding background */}
    <div
      className={`absolute top-1 left-1 h-[62px] w-[170px] rounded-full transition-all duration-500
        ${
          selectedInstallationType === "water"
            ? "translate-x-0 bg-gradient-to-r from-blue-500 to-cyan-400"
            : "translate-x-[180px] bg-gradient-to-r from-orange-400 to-yellow-400"
        }`}
    />

    {/* Buttons */}
    <div className="relative z-10 flex h-full">
      <button
        onClick={() => setSelectedInstallationType("water")}
        className={`w-1/2 text-lg font-bold transition-all
          ${
            selectedInstallationType === "water"
              ? "text-white scale-105"
              : "text-gray-500"
          }`}
      >
        💧 Water
      </button>

      <button
        onClick={() => setSelectedInstallationType("solar")}
        className={`w-1/2 text-lg font-bold transition-all
          ${
            selectedInstallationType === "solar"
              ? "text-white scale-105"
              : "text-gray-500"
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
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

  {/* TOTAL */}
  <div
    className={`rounded-lg p-5 border-2 transition-colors
      ${
        selectedInstallationType === "water"
          ? "bg-blue-100 border-blue-400"
          : "bg-orange-100 border-orange-400"
      }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-800">
          Total {selectedInstallationType === "water" ? "Water" : "Solar"}
        </p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">
          {stats.total}
        </h3>
      </div>
      <Calendar
        className={`w-9 h-9 ${
          selectedInstallationType === "water"
            ? "text-blue-700"
            : "text-orange-700"
        }`}
      />
    </div>
  </div>

  {/* PENDING */}
  <div
    className={`rounded-lg p-5 border-2 transition-colors
      ${
        selectedInstallationType === "water"
          ? "bg-blue-50 border-blue-300"
          : "bg-orange-50 border-orange-300"
      }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-800">
          Pending
        </p>
        <h3
          className={`text-2xl font-bold mt-1 ${
            selectedInstallationType === "water"
              ? "text-blue-900"
              : "text-orange-900"
          }`}
        >
          {stats.pending}
        </h3>
      </div>
      <Clock
        className={`w-9 h-9 ${
          selectedInstallationType === "water"
            ? "text-blue-700"
            : "text-orange-700"
        }`}
      />
    </div>
  </div>

  {/* IN PROGRESS */}
  <div
    className={`rounded-lg p-5 border-2 transition-colors
      ${
        selectedInstallationType === "water"
          ? "bg-blue-50 border-blue-300"
          : "bg-orange-50 border-orange-300"
      }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-800">
          In Progress
        </p>
        <h3
          className={`text-2xl font-bold mt-1 ${
            selectedInstallationType === "water"
              ? "text-blue-900"
              : "text-orange-900"
          }`}
        >
          {stats.inProgress}
        </h3>
      </div>
      <AlertCircle
        className={`w-9 h-9 ${
          selectedInstallationType === "water"
            ? "text-blue-700"
            : "text-orange-700"
        }`}
      />
    </div>
  </div>

  {/* COMPLETED */}
  <div
    className={`rounded-lg p-5 border-2 transition-colors
      ${
        selectedInstallationType === "water"
          ? "bg-blue-50 border-blue-300"
          : "bg-orange-50 border-orange-300"
      }`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide font-semibold text-gray-800">
          Completed
        </p>
        <h3
          className={`text-2xl font-bold mt-1 ${
            selectedInstallationType === "water"
              ? "text-blue-900"
              : "text-orange-900"
          }`}
        >
          {stats.completed}
        </h3>
      </div>
      <CheckCircle
        className={`w-9 h-9 ${
          selectedInstallationType === "water"
            ? "text-blue-700"
            : "text-orange-700"
        }`}
      />
    </div>
  </div>

</div>


        {/* Tabs */}
<div className="bg-white border border-gray-200 rounded-lg mb-6">
  <div className="flex border-b border-gray-200 overflow-x-auto">

    {/* ALL */}
    <button
      onClick={() => setActiveTab('all')}
      className={`px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap border-b-4
        ${
          activeTab === 'all'
            ? selectedInstallationType === 'water'
              ? 'border-blue-600 text-blue-700'
              : 'border-orange-600 text-orange-700'
            : 'border-transparent text-gray-700 hover:text-gray-900'
        }`}
    >
      All ({stats.total})
    </button>

    {/* PENDING */}
    <button
      onClick={() => setActiveTab('pending')}
      className={`px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap border-b-4
        ${
          activeTab === 'pending'
            ? selectedInstallationType === 'water'
              ? 'border-blue-600 text-blue-700'
              : 'border-orange-600 text-orange-700'
            : 'border-transparent text-gray-700 hover:text-gray-900'
        }`}
    >
      Pending ({stats.pending})
    </button>

    {/* IN PROGRESS */}
    <button
      onClick={() => setActiveTab('in-progress')}
      className={`px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap border-b-4
        ${
          activeTab === 'in-progress'
            ? selectedInstallationType === 'water'
              ? 'border-blue-600 text-blue-700'
              : 'border-orange-600 text-orange-700'
            : 'border-transparent text-gray-700 hover:text-gray-900'
        }`}
    >
      In Progress ({stats.inProgress})
    </button>

    {/* COMPLETED */}
    <button
      onClick={() => setActiveTab('completed')}
      className={`px-6 py-4 text-sm font-semibold transition-colors whitespace-nowrap border-b-4
        ${
          activeTab === 'completed'
            ? selectedInstallationType === 'water'
              ? 'border-blue-600 text-blue-700'
              : 'border-orange-600 text-orange-700'
            : 'border-transparent text-gray-700 hover:text-gray-900'
        }`}
    >
      Completed ({stats.completed})
    </button>

  </div>
</div>

        {/* Filters */}
<div
  className={`rounded-lg p-5 mb-6 border-2 transition-colors
    ${
      selectedInstallationType === "water"
        ? "bg-blue-50 border-blue-300"
        : "bg-orange-50 border-orange-300"
    }`}
>
  {/* Header */}
  <div className="flex items-center gap-2 mb-4">
    <Filter
      className={`w-5 h-5 ${
        selectedInstallationType === "water"
          ? "text-blue-700"
          : "text-orange-700"
      }`}
    />
    <h2 className="text-base font-semibold text-gray-900">
      Filters
    </h2>
  </div>

  {/* Controls */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

    {/* Search */}
    <div className="relative col-span-2">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        name="search"
        placeholder={`Search ${selectedInstallationType} installations...`}
        value={filters.search}
        onChange={handleFilterChange}
        className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border-2 bg-white
          focus:outline-none transition
          ${
            selectedInstallationType === "water"
              ? "border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
              : "border-orange-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-500"
          }`}
      />
    </div>

    {/* Limit */}
    <select
      name="limit"
      value={filters.limit}
      onChange={handleFilterChange}
      className={`px-3 py-2 text-sm rounded-md border-2 bg-white
        focus:outline-none transition
        ${
          selectedInstallationType === "water"
            ? "border-blue-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
            : "border-orange-300 focus:ring-2 focus:ring-orange-400 focus:border-orange-500"
        }`}
    >
      <option value="10">10 per page</option>
      <option value="25">25 per page</option>
      <option value="50">50 per page</option>
    </select>

    {/* Clear */}
    <button
      onClick={clearFilters}
      className={`flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-md font-semibold transition-colors
        ${
          selectedInstallationType === "water"
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-orange-500 hover:bg-orange-600 text-white"
        }`}
    >
      <X className="w-4 h-4" />
      Clear
    </button>

  </div>
</div>


        {/* Installations Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          {paginatedInstallations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No installations found</h3>
              <p className="text-gray-600 mb-4">Create your first installation to get started</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sl.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                      {selectedInstallationType === "solar" && (
  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
    Required kW
  </th>
)}

                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Scheduled Visit</th>
                      {activeTab === 'in-progress' && (
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Installation Date</th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedInstallations.map((installation, idx) => {
                      const stageConfig = getStatusConfig(installation.status);
                      const StatusIcon = stageConfig.icon;
                      return (
                        <tr key={installation._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-700">
                              {(currentPage - 1) * filters.limit + idx + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{installation.clientName}</div>
                          </td>
                          <td className="px-6 py-4">
                            {installation.contact ? (
                              <a
                                href={`https://wa.me/91${installation.contact.replace(/\D/g, '')}?text=Hello ${encodeURIComponent(installation.clientName)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                              >
                                <Phone className="w-4 h-4" />
                                {installation.contact}
                              </a>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{installation.productToInstall}</span>
                            </div>
                          </td>
                          {selectedInstallationType === "solar" && (
  <td className="px-6 py-4">
    <span className="text-sm font-medium text-gray-900">
      {installation.requiredKW ? `${installation.requiredKW} kW` : "—"}
    </span>
  </td>
)}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{installation.location || '—'}</span>
                              {installation.locationLink && (
                                <a
                                  href={installation.locationLink}
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
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {installation.lead?.scheduleVisit 
                                ? new Date(installation.lead.scheduleVisit).toLocaleDateString()
                                : '—'}
                            </div>
                          </td>
                          {activeTab === 'in-progress' && (
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600">
                                {installation.dateOfInstallation 
                                  ? new Date(installation.dateOfInstallation).toLocaleDateString()
                                  : '—'}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${stageConfig.bg} ${stageConfig.text} border ${stageConfig.border}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {installation.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {installation.status === 'pending' && (
                                <>
                                  {/* <button
                                    onClick={() => openRescheduleModal(installation)}
                                    className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-md transition-colors"
                                    title="Reschedule"
                                  >
                                    <Calendar className="w-4 h-4" />
                                  </button> */}
                                  <button
                                    onClick={() => openEditModal(installation)}
                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                    title="Start Installation"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              {installation.status === 'in-progress' && (
                                <button
                                  onClick={() => openCompleteModal(installation)}
                                  className="p-2 hover:bg-green-50 text-green-600 rounded-md transition-colors"
                                  title="Complete Installation"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              {installation.status !== 'completed' && (
                                <button
                                  onClick={() => handleDeleteInstallation(installation._id)}
                                  className="p-2 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page <span className="font-semibold">{currentPage}</span> of {totalPages}
                    <span className="text-gray-500 ml-2">({filteredInstallations.length} total)</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create Installation Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Create New Installation</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateInstallation} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Lead ID (Optional)</label>
                    <input
                      type="text"
                      value={createForm.lead}
                      onChange={(e) => setCreateForm({...createForm, lead: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={createForm.clientName}
                      onChange={(e) => setCreateForm({...createForm, clientName: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                    <input
                      type="text"
                      value={createForm.contact}
                      onChange={(e) => setCreateForm({...createForm, contact: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product to Install *</label>
                    <input
                      type="text"
                      required
                      value={createForm.productToInstall}
                      onChange={(e) => setCreateForm({...createForm, productToInstall: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={createForm.location}
                    onChange={(e) => setCreateForm({...createForm, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location Link (Google Maps)</label>
                  <input
                    type="url"
                    value={createForm.locationLink}
                    onChange={(e) => setCreateForm({...createForm, locationLink: e.target.value})}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={createForm.notes}
                    onChange={(e) => setCreateForm({...createForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> The scheduled visit date will come from the Lead's schedule visit date automatically.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Installation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal - Start Installation */}
        {showEditModal && selectedInstallation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Start Installation</h2>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Client:</span> {selectedInstallation.clientName}
                    </p>
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Contact:</span> {selectedInstallation.contact || 'N/A'}
                    </p>
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Product:</span> {selectedInstallation.productToInstall}
                    </p>
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Scheduled:</span> {selectedInstallation.lead?.scheduleVisit 
                        ? new Date(selectedInstallation.lead.scheduleVisit).toLocaleDateString()
                        : 'Not set'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUpdateToInProgress} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Installation Date * <span className="text-gray-500">(Actual date when installation work starts)</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={editForm.dateOfInstallation}
                      onChange={(e) => setEditForm({...editForm, dateOfInstallation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Installation
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Complete Installation Modal */}
        {showCompleteModal && selectedInstallation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Complete Installation</h2>
                  <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCompleteInstallation} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Client:</span> {selectedInstallation.clientName}
                    </p>
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Product:</span> {selectedInstallation.productToInstall}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date *</label>
                      <input
                        type="date"
                        required
                        value={completeForm.completedDate}
                        onChange={(e) => setCompleteForm({...completeForm, completedDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Installation Value (₹) *</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g., 50000"
                        value={completeForm.installationValue}
                        onChange={(e) => setCompleteForm({...completeForm, installationValue: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Products Used Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Products Used *</label>
                      <button
                        type="button"
                        onClick={addProduct}
                        className="flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        Add Product
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {completeForm.productsUsed.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start">
  <div className="flex-1">
    <select
      required
      value={item.product}
      onChange={(e) => updateProduct(index, 'product', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Select Product</option>
      {products.map((product) => (
        <option key={product._id} value={product._id}>
          {product.name} - {product.category}
        </option>
      ))}
    </select>
  </div>
  <div className="w-24">
    <input
      type="number"
      required
      min="1"
      placeholder="Qty"
      value={item.quantity}
      onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
  <div className="w-24">
    <select
      required
      value={item.unit}
      onChange={(e) => updateProduct(index, 'unit', e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="pieces">Pieces</option>
      <option value="kg">Kg</option>
    </select>
  </div>
  {completeForm.productsUsed.length > 1 && (
    <button
      type="button"
      onClick={() => removeProduct(index)}
      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
      title="Remove"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )}
</div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Add all products used during installation with quantities</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion Notes *</label>
                    <textarea
                      required
                      value={completeForm.notes}
                      onChange={(e) => setCompleteForm({...completeForm, notes: e.target.value})}
                      placeholder="Add detailed notes about the installation completion..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="4"
                    />
                  </div>

                  {/* AMC Section */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="checkbox"
                        id="hasAMC"
                        checked={completeForm.hasAMC}
                        onChange={(e) => setCompleteForm({...completeForm, hasAMC: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="hasAMC" className="text-sm font-medium text-gray-700">
                        This installation includes AMC (Annual Maintenance Contract)
                      </label>
                    </div>

                    {completeForm.hasAMC && (
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          AMC Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              AMC Start Date *
                            </label>
                            <input
                              type="date"
                              required={completeForm.hasAMC}
                              value={completeForm.amcDetails.startDate}
                              onChange={(e) => setCompleteForm({
                                ...completeForm,
                                amcDetails: {...completeForm.amcDetails, startDate: e.target.value}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              AMC Type *
                            </label>
                            <select
                              required={completeForm.hasAMC}
                              value={completeForm.amcDetails.amcType}
                              onChange={(e) => setCompleteForm({
                                ...completeForm,
                                amcDetails: {...completeForm.amcDetails, amcType: e.target.value}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="4-visits">4 Visits (Quarterly)</option>
                              <option value="8-visits">8 Visits (Every 1.5 months)</option>
                              <option value="12-visits">12 Visits (Monthly)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              {completeForm.amcDetails.amcType === '4-visits' && 'Visit every 3 months'}
                              {completeForm.amcDetails.amcType === '8-visits' && 'Visit every 1.5 months'}
                              {completeForm.amcDetails.amcType === '12-visits' && 'Visit every month'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              AMC Value (₹) *
                            </label>
                            <input
                              type="number"
                              required={completeForm.hasAMC}
                              placeholder="e.g., 12000"
                              value={completeForm.amcDetails.amcValue}
                              onChange={(e) => setCompleteForm({
                                ...completeForm,
                                amcDetails: {...completeForm.amcDetails, amcValue: e.target.value}
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            AMC Notes
                          </label>
                          <textarea
                            value={completeForm.amcDetails.notes}
                            onChange={(e) => setCompleteForm({
                              ...completeForm,
                              amcDetails: {...completeForm.amcDetails, notes: e.target.value}
                            })}
                            placeholder="Add any specific terms, conditions, or notes about this AMC..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="3"
                          />
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">
                            <span className="font-semibold">Note:</span> Visit schedule will be automatically 
                            generated based on the AMC type. You'll be able to manage visits in the AMC Dashboard.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Note:</span> Completing this installation will automatically create a Client Data entry{completeForm.hasAMC ? ' and an AMC record' : ''}.
                    </p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Complete & Forward to Client Data
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCompleteModal(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default InstallationDashboard;