import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, X, Edit2, Trash2, Plus, RefreshCw, 
  ChevronLeft, ChevronRight, MapPin, Phone, Mail, Package, 
  Calendar, DollarSign, FileText, ExternalLink, CheckCircle, 
  XCircle, Award, TrendingUp 
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { 
  getClients, 
  createClient, 
  updateClient, 
  deleteClient, 
  getClientStats 
} from '../../api/clientapi';

const ClientDashboard = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalClients, setTotalClients] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    hasAMC: '',
    limit: 10
  });

  const [formData, setFormData] = useState({
    clientName: '',
    contactNumber: '',
    email: '',
    location: '',
    locationLink: '',
    dateOfInstallation: '',
    installationValue: '',
    warrantyExpiry: '',
    notes: '',
    hasAMC: false,
    amcType: ''
  });

  useEffect(() => {
    if (token) {
      fetchClients();
      if (user?.role === 'admin') {
        fetchStats();
      }
    }
  }, [token, currentPage, filters]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: currentPage,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.hasAMC && { hasAMC: filters.hasAMC })
      };
      const response = await getClients(params, token);
      setClients(response.data || []);
      setTotalClients(response.total || 0);
      setTotalPages(Math.ceil((response.total || 0) / filters.limit));
    } catch (err) {
      setError(err.message || 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getClientStats(token);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await createClient(formData, token);
      setSuccess('Client created successfully!');
      await fetchClients();
      if (user?.role === 'admin') await fetchStats();
      setShowCreateModal(false);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClient = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await updateClient(selectedClient._id, formData, token);
      setSuccess('Client updated successfully!');
      await fetchClients();
      if (user?.role === 'admin') await fetchStats();
      setShowEditModal(false);
      setSelectedClient(null);
      resetForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async () => {
    try {
      setLoading(true);
      setError('');
      await deleteClient(selectedClient._id, token);
      setSuccess('Client deleted successfully!');
      await fetchClients();
      if (user?.role === 'admin') await fetchStats();
      setShowDeleteModal(false);
      setSelectedClient(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete client');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      clientName: client.clientName || '',
      contactNumber: client.contactNumber || '',
      email: client.email || '',
      location: client.location || '',
      locationLink: client.locationLink || '',
      dateOfInstallation: client.dateOfInstallation 
        ? new Date(client.dateOfInstallation).toISOString().split('T')[0] 
        : '',
      installationValue: client.installationValue || '',
      warrantyExpiry: client.warrantyExpiry 
        ? new Date(client.warrantyExpiry).toISOString().split('T')[0] 
        : '',
      notes: client.notes || '',
      hasAMC: client.hasAMC || false,
      amcType: client.amcType || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      contactNumber: '',
      email: '',
      location: '',
      locationLink: '',
      dateOfInstallation: '',
      installationValue: '',
      warrantyExpiry: '',
      notes: '',
      hasAMC: false,
      amcType: ''
    });
    setSelectedClient(null);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', hasAMC: '', limit: 10 });
    setCurrentPage(1);
  };


// Filter clients based on active tab
const filteredClients = clients.filter(client => {
  if (activeTab === 'all') return true;
  if (activeTab === 'amc') return client.hasAMC && client.amcDetails;
  if (activeTab === 'no-amc') return !client.hasAMC || !client.amcDetails;
  return true;
});

  const displayStats = stats || {
  totalClients: clients.length,
  withAMC: clients.filter(c => c.hasAMC && c.amcDetails).length,
  withoutAMC: clients.filter(c => !c.hasAMC || !c.amcDetails).length,
  totalValue: clients.reduce((sum, c) => sum + (c.installationValue || 0), 0)
};

  if (loading && clients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 lg:pl-64 mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64 mt-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Client Database</h1>
              <p className="text-sm text-gray-600 mt-1">Manage all client records and installations</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  fetchClients();
                  if (user?.role === 'admin') fetchStats();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              {(user?.role === 'admin' || user?.role === 'office') && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </button>
              )}
            </div>
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
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Clients</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{displayStats.totalClients}</h3>
              </div>
              <Users className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">With AMC</p>
                <h3 className="text-2xl font-semibold text-green-900 mt-1">{displayStats.withAMC}</h3>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Without AMC</p>
                <h3 className="text-2xl font-semibold text-orange-900 mt-1">{displayStats.withoutAMC}</h3>
              </div>
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Value</p>
                <h3 className="text-2xl font-semibold text-blue-900 mt-1">
                  ₹{(displayStats.totalValue || 0).toLocaleString('en-IN')}
                </h3>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-lg mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
           <button
  onClick={() => setActiveTab('all')}
  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
    activeTab === 'all'
      ? 'border-b-2 border-blue-600 text-blue-600'
      : 'text-gray-600 hover:text-gray-900'
  }`}
>
  All Clients ({clients.length})
</button>
<button
  onClick={() => setActiveTab('amc')}
  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
    activeTab === 'amc'
      ? 'border-b-2 border-blue-600 text-blue-600'
      : 'text-gray-600 hover:text-gray-900'
  }`}
>
  With AMC ({clients.filter(c => c.hasAMC && c.amcDetails).length})
</button>
<button
  onClick={() => setActiveTab('no-amc')}
  className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
    activeTab === 'no-amc'
      ? 'border-b-2 border-blue-600 text-blue-600'
      : 'text-gray-600 hover:text-gray-900'
  }`}
>
  Without AMC ({clients.filter(c => !c.hasAMC || !c.amcDetails).length})
</button>
            
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search by name, contact, email..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              name="hasAMC"
              value={filters.hasAMC}
              onChange={handleFilterChange}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All AMC Status</option>
              <option value="true">With AMC</option>
              <option value="false">Without AMC</option>
            </select>
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          {filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No clients found</h3>
              <p className="text-gray-600 mb-4">Add your first client to get started</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sl.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Serial No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Client Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Products Installed</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Installation Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">AMC Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredClients.map((client, idx) => (
                      <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-700">
                            {(currentPage - 1) * filters.limit + idx + 1}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-blue-600">{client.serialNo}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{client.clientName}</div>
                          {client.email && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {client.contactNumber ? (
                            <a
                              href={`https://wa.me/91${client.contactNumber.replace(/\D/g, '')}?text=Hello ${encodeURIComponent(client.clientName)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              {client.contactNumber}
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{client.location || '—'}</span>
                            {client.locationLink && (
                              <a
                                href={client.locationLink}
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
  <div className="flex flex-col gap-1">
    {client.productsInstalled && client.productsInstalled.length > 0 ? (
      client.productsInstalled.map((item, idx) => (
        <div key={item._id || idx} className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">
            {item.product?.name || 'Unknown'} ({item.quantity} {item.unit})
          </span>
        </div>
      ))
    ) : (
      <div className="flex items-center gap-2">
        <Package className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">No products</span>
      </div>
    )}
  </div>
</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {client.dateOfInstallation 
                              ? new Date(client.dateOfInstallation).toLocaleDateString()
                              : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {client.installationValue 
                              ? `₹${client.installationValue.toLocaleString('en-IN')}`
                              : '—'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {client.hasAMC ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-300">
                                <CheckCircle className="w-3.5 h-3.5" />
                                Active AMC
                              </span>
                              {client.amcType && (
                                <div className="text-xs text-gray-500 mt-1">{client.amcType}</div>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-300">
                              <XCircle className="w-3.5 h-3.5" />
                              No AMC
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {(user?.role === 'admin' || user?.role === 'office') && (
                              <>
                                <button
                                  onClick={() => openEditModal(client)}
                                  className="p-2 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                {user?.role === 'admin' && (
                                  <button
                                    onClick={() => {
                                      setSelectedClient(client);
                                      setShowDeleteModal(true);
                                    }}
                                    className="p-2 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
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
                    <span className="text-gray-500 ml-2">({totalClients} total)</span>
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

        {/* Create Client Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateClient} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Link</label>
                    <input
                      type="url"
                      value={formData.locationLink}
                      onChange={(e) => setFormData({...formData, locationLink: e.target.value})}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Installation Date</label>
                    <input
                      type="date"
                      value={formData.dateOfInstallation}
                      onChange={(e) => setFormData({...formData, dateOfInstallation: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Installation Value (₹)</label>
                    <input
                      type="number"
                      value={formData.installationValue}
                      onChange={(e) => setFormData({...formData, installationValue: e.target.value})}
                      placeholder="e.g., 50000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Warranty Expiry</label>
                    <input
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({...formData, warrantyExpiry: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="createHasAMC"
                      checked={formData.hasAMC}
                      onChange={(e) => setFormData({...formData, hasAMC: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="createHasAMC" className="text-sm font-medium text-gray-700">
                      Has AMC
                    </label>
                  </div>
                  {formData.hasAMC && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">AMC Type</label>
                      <select
                        value={formData.amcType}
                        onChange={(e) => setFormData({...formData, amcType: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select AMC Type</option>
                        <option value="4 Visits">4 Visits</option>
                        <option value="8 Visits">8 Visits</option>
                        <option value="12 Visits">12 Visits</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Client Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Edit Client</h2>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateClient} className="p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Number</label>
                    <input
                      type="text"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Location Link</label>
                    <input
                      type="url"
                      value={formData.locationLink}
                      onChange={(e) => setFormData({...formData, locationLink: e.target.value})}
                      placeholder="https://maps.google.com/..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Installation Date</label>
                    <input
                      type="date"
                      value={formData.dateOfInstallation}
                      onChange={(e) => setFormData({...formData, dateOfInstallation: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Installation Value (₹)</label>
                    <input
                      type="number"
                      value={formData.installationValue}
                      onChange={(e) => setFormData({...formData, installationValue: e.target.value})}
                      placeholder="e.g., 50000"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Warranty Expiry</label>
                    <input
                      type="date"
                      value={formData.warrantyExpiry}
                      onChange={(e) => setFormData({...formData, warrantyExpiry: e.target.value})}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="editHasAMC"
                      checked={formData.hasAMC}
                      onChange={(e) => setFormData({...formData, hasAMC: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="editHasAMC" className="text-sm font-medium text-gray-700">
                      Has AMC
                    </label>
                  </div>
                  {formData.hasAMC && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">AMC Type</label>
                      <select
                        value={formData.amcType}
                        onChange={(e) => setFormData({...formData, amcType: e.target.value})}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select AMC Type</option>
                        <option value="4 Visits">4 Visits</option>
                        <option value="8 Visits">8 Visits</option>
                        <option value="12 Visits">12 Visits</option>
                      </select>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    placeholder="Add any additional notes..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-gray-200">
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
                    {loading ? 'Updating...' : 'Update Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Client</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete <span className="font-medium text-gray-900">{selectedClient?.clientName}</span>? 
                  This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClient}
                    disabled={loading}
                    className="flex-1 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ClientDashboard;