import { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle, Clock, AlertCircle, Plus, X, Edit2, 
  Trash2, RefreshCw, Filter, Search, ChevronLeft, ChevronRight, 
  MapPin, Phone, Mail, Package, ExternalLink, XCircle, PlayCircle,
  FileText, DollarSign, Users, TrendingUp, Bell
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { 
  getAllAMCs, 
  getAMCById, 
  createAMC, 
  updateAMC, 
  cancelAMC, 
  deleteAMC,
  updateAMCVisit,
  completeAMCVisit,
  rescheduleAMCVisit,
  getUpcomingVisits,
  getExpiringAMCs
} from '../../api/amcapi';

const AMCDashboard = () => {
  const [amcs, setAmcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAMC, setSelectedAMC] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [expiringAMCs, setExpiringAMCs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    limit: 10
  });

  const { token } = useSelector((state) => state.auth);

  // Visit completion form
  const [visitForm, setVisitForm] = useState({
    completedDate: new Date().toISOString().split('T')[0],
    notes: '',
    servicesPerformed: '',
    productsUsed: [],
    feedback: ''
  });

  // Reschedule form
  const [rescheduleForm, setRescheduleForm] = useState({
    newDate: '',
    reason: ''
  });

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, currentPage, filters]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [amcsRes, upcomingRes, expiringRes] = await Promise.all([
        getAllAMCs({ ...filters, page: currentPage }, token),
        getUpcomingVisits({ days: 7 }, token),
        getExpiringAMCs({ days: 30 }, token)
      ]);

      setAmcs(amcsRes.data || []);
      setUpcomingVisits(upcomingRes.data || []);
      setExpiringAMCs(expiringRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch AMC data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteVisit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await completeAMCVisit(
        selectedAMC._id, 
        selectedVisit.visitNumber, 
        visitForm, 
        token
      );
      setSuccess('Visit completed successfully!');
      await fetchAllData();
      setShowVisitModal(false);
      resetVisitForm();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to complete visit');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleVisit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await rescheduleAMCVisit(
        selectedAMC._id,
        selectedVisit.visitNumber,
        { scheduledDate: rescheduleForm.newDate, notes: rescheduleForm.reason },
        token
      );
      setSuccess('Visit rescheduled successfully!');
      await fetchAllData();
      setShowVisitModal(false);
      setRescheduleForm({ newDate: '', reason: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reschedule visit');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAMC = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this AMC?')) return;
    
    const reason = prompt('Please enter cancellation reason:');
    if (!reason) return;

    try {
      setLoading(true);
      await cancelAMC(id, { cancellationReason: reason }, token);
      setSuccess('AMC cancelled successfully!');
      await fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel AMC');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAMC = async (id) => {
    if (!window.confirm('Are you sure you want to delete this AMC? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      await deleteAMC(id, token);
      setSuccess('AMC deleted successfully!');
      await fetchAllData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete AMC');
    } finally {
      setLoading(false);
    }
  };

  const openVisitModal = (amc, visit) => {
    setSelectedAMC(amc);
    setSelectedVisit(visit);
    setVisitForm({
      completedDate: new Date().toISOString().split('T')[0],
      notes: '',
      servicesPerformed: '',
      productsUsed: [],
      feedback: ''
    });
    setShowVisitModal(true);
  };

  const openDetailsModal = async (amcId) => {
    try {
      setLoading(true);
      const response = await getAMCById(amcId, token);
      setSelectedAMC(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      setError(err.message || 'Failed to fetch AMC details');
    } finally {
      setLoading(false);
    }
  };

  const resetVisitForm = () => {
    setVisitForm({
      completedDate: new Date().toISOString().split('T')[0],
      notes: '',
      servicesPerformed: '',
      productsUsed: [],
      feedback: ''
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { 
        bg: 'bg-green-50', 
        text: 'text-green-700', 
        border: 'border-green-300',
        icon: CheckCircle
      },
      expired: { 
        bg: 'bg-red-50', 
        text: 'text-red-700', 
        border: 'border-red-300',
        icon: XCircle
      },
      cancelled: { 
        bg: 'bg-gray-50', 
        text: 'text-gray-700', 
        border: 'border-gray-300',
        icon: X
      }
    };
    return configs[status] || configs.active;
  };

  const getVisitStatusConfig = (status) => {
    const configs = {
      pending: { 
        bg: 'bg-yellow-50', 
        text: 'text-yellow-700', 
        border: 'border-yellow-300',
        icon: Clock
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
      },
      rescheduled: { 
        bg: 'bg-blue-50', 
        text: 'text-blue-700', 
        border: 'border-blue-300',
        icon: RefreshCw
      }
    };
    return configs[status] || configs.pending;
  };

  // Filter AMCs
  const filteredAMCs = amcs.filter(amc => {
    if (activeTab !== 'all' && amc.status !== activeTab) return false;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        amc.clientName?.toLowerCase().includes(searchLower) ||
        amc.contactNumber?.toLowerCase().includes(searchLower) ||
        amc.product?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const stats = {
    total: amcs.length,
    active: amcs.filter(a => a.status === 'active').length,
    expired: amcs.filter(a => a.status === 'expired').length,
    upcoming: upcomingVisits.length,
    expiringSoon: expiringAMCs.length
  };

  const totalPages = Math.ceil(filteredAMCs.length / filters.limit);
  const paginatedAMCs = filteredAMCs.slice(
    (currentPage - 1) * filters.limit,
    currentPage * filters.limit
  );

  if (loading && amcs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 lg:pl-64 mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AMC data...</p>
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
              <h1 className="text-2xl font-semibold text-gray-900">AMC Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage annual maintenance contracts and service visits</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchAllData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total AMCs</p>
                <h3 className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</h3>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active</p>
                <h3 className="text-2xl font-semibold text-green-900 mt-1">{stats.active}</h3>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Upcoming Visits</p>
                <h3 className="text-2xl font-semibold text-blue-900 mt-1">{stats.upcoming}</h3>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Expiring Soon</p>
                <h3 className="text-2xl font-semibold text-orange-900 mt-1">{stats.expiringSoon}</h3>
              </div>
              <Bell className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Expired</p>
                <h3 className="text-2xl font-semibold text-red-900 mt-1">{stats.expired}</h3>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Upcoming Visits Alert */}
        {upcomingVisits.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Upcoming Visits (Next 7 Days)</h3>
                <div className="space-y-2">
                  {upcomingVisits.slice(0, 3).map((visit, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm text-blue-800">
                      <span>
                        <span className="font-medium">{visit.clientName}</span> - Visit #{visit.visitNumber}
                      </span>
                      <span className="text-blue-600">
                        {new Date(visit.scheduledDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
              All ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'active'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'expired'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Expired ({stats.expired})
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
                placeholder="Search by client, product..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              name="limit"
              value={filters.limit}
              onChange={(e) => setFilters({...filters, limit: parseInt(e.target.value)})}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <button
              onClick={() => setFilters({ search: '', status: '', limit: 10 })}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* AMCs Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          {paginatedAMCs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No AMCs found</h3>
              <p className="text-gray-600">AMCs will appear here after installation completion</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Sl.No</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">AMC Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Visits</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedAMCs.map((amc, idx) => {
                      const statusConfig = getStatusConfig(amc.status);
                      const StatusIcon = statusConfig.icon;
                      const completedVisits = amc.visits?.filter(v => v.status === 'completed').length || 0;
                      const totalVisits = amc.visits?.length || 0;
                      
                      return (
                        <tr key={amc._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-700">
                              {(currentPage - 1) * filters.limit + idx + 1}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{amc.clientName}</div>
                            {amc.contactNumber && (
                              <a
                                href={`https://wa.me/91${amc.contactNumber.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-1"
                              >
                                <Phone className="w-3 h-3" />
                                {amc.contactNumber}
                              </a>
                            )}
                          </td>
                          <td className="px-6 py-4">
  <div className="flex flex-col gap-1">
    {amc.products && amc.products.length > 0 ? (
      amc.products.map((item, idx) => (
        <div key={item._id || idx} className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">
            {item.name} ({item.quantity} {item.unit})
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
                            <span className="text-sm text-gray-700 font-medium">
                              {amc.amcType}
                            </span>
                            <div className="text-xs text-gray-500">
                              {amc.visitsPerYear} visits/year
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {new Date(amc.startDate).toLocaleDateString()} 
                              <br />
                              to {new Date(amc.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {completedVisits} / {totalVisits}
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(completedVisits / totalVisits) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {amc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openDetailsModal(amc._id)}
                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-md transition-colors"
                                title="View Details"
                              >
                                <FileText className="w-4 h-4" />
                              </button>
                              {amc.status === 'active' && (
                                <button
                                  onClick={() => handleCancelAMC(amc._id)}
                                  className="p-2 hover:bg-red-50 text-red-600 rounded-md transition-colors"
                                  title="Cancel AMC"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAMC(amc._id)}
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

        {/* AMC Details Modal */}
        {showDetailsModal && selectedAMC && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailsModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">AMC Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Client Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-3">Client Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Client Name</p>
                      <p className="text-blue-900">{selectedAMC.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Contact</p>
                      <p className="text-blue-900">{selectedAMC.contactNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Product</p>
                      <p className="text-blue-900">{selectedAMC.product}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Installation Date</p>
                      <p className="text-blue-900">
                        {new Date(selectedAMC.dateOfInstallation).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AMC Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-3">AMC Information</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-sm text-green-700 font-medium">AMC Type</p>
                      <p className="text-green-900">{selectedAMC.amcType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Visits/Year</p>
                      <p className="text-green-900">{selectedAMC.visitsPerYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Start Date</p>
                      <p className="text-green-900">
                        {new Date(selectedAMC.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">End Date</p>
                      <p className="text-green-900">
                        {new Date(selectedAMC.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Status</p>
                      <p className="text-green-900 font-semibold">{selectedAMC.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">AMC Amount</p>
                      <p className="text-green-900">
                        {selectedAMC.amcAmount ? `₹${selectedAMC.amcAmount.toLocaleString()}` : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Payment Status</p>
                      <p className="text-green-900 capitalize">{selectedAMC.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Interval</p>
                      <p className="text-green-900">{selectedAMC.intervalInMonths} months</p>
                    </div>
                  </div>
                  {selectedAMC.notes && (
                    <div className="mt-3">
                      <p className="text-sm text-green-700 font-medium">Notes</p>
                      <p className="text-green-900 text-sm mt-1">{selectedAMC.notes}</p>
                    </div>
                  )}
                </div>

                {/* Visits Schedule */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    Visit Schedule
                  </h3>
                  <div className="space-y-3">
                    {selectedAMC.visits && selectedAMC.visits.length > 0 ? (
                      selectedAMC.visits.map((visit) => {
                        const visitStatusConfig = getVisitStatusConfig(visit.status);
                        const VisitIcon = visitStatusConfig.icon;
                        const isPending = visit.status === 'pending';
                        const isOverdue = isPending && new Date(visit.scheduledDate) < new Date();
                        
                        return (
                          <div 
                            key={visit.visitNumber} 
                            className={`border rounded-lg p-4 ${
                              isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-gray-900">
                                    Visit #{visit.visitNumber}
                                  </span>
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${visitStatusConfig.bg} ${visitStatusConfig.text} border ${visitStatusConfig.border}`}>
                                    <VisitIcon className="w-3 h-3" />
                                    {visit.status}
                                  </span>
                                  {isOverdue && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                                      <AlertCircle className="w-3 h-3" />
                                      Overdue
                                    </span>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-600">Scheduled:</span>
                                    <span className="text-gray-900 ml-2 font-medium">
                                      {new Date(visit.scheduledDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                  {visit.completedDate && (
                                    <div>
                                      <span className="text-gray-600">Completed:</span>
                                      <span className="text-gray-900 ml-2 font-medium">
                                        {new Date(visit.completedDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {visit.assignedTo && (
                                    <div>
                                      <span className="text-gray-600">Assigned To:</span>
                                      <span className="text-gray-900 ml-2 font-medium">
                                        {visit.assignedTo.name || 'N/A'}
                                      </span>
                                    </div>
                                  )}
                                  {visit.servicesPerformed && (
                                    <div className="md:col-span-2">
                                      <span className="text-gray-600">Services:</span>
                                      <span className="text-gray-900 ml-2">{visit.servicesPerformed}</span>
                                    </div>
                                  )}
                                  {visit.notes && (
                                    <div className="md:col-span-2">
                                      <span className="text-gray-600">Notes:</span>
                                      <span className="text-gray-900 ml-2">{visit.notes}</span>
                                    </div>
                                  )}
                                  {visit.feedback && (
                                    <div className="md:col-span-2">
                                      <span className="text-gray-600">Feedback:</span>
                                      <span className="text-gray-900 ml-2">{visit.feedback}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Visit Actions */}
                              {visit.status === 'pending' && selectedAMC.status === 'active' && (
                                <div className="flex gap-2 ml-4">
                                  <button
                                    onClick={() => openVisitModal(selectedAMC, visit)}
                                    className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-md transition-colors"
                                    title="Complete Visit"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedVisit(visit);
                                      setRescheduleForm({ 
                                        newDate: new Date(visit.scheduledDate).toISOString().split('T')[0],
                                        reason: '' 
                                      });
                                    }}
                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors"
                                    title="Reschedule"
                                  >
                                    <RefreshCw className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No visits scheduled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Visit Completion Modal */}
        {showVisitModal && selectedAMC && selectedVisit && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={() => setShowVisitModal(false)}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Complete Visit #{selectedVisit.visitNumber}
                </h2>
                <button onClick={() => setShowVisitModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-blue-700 font-medium">Client</p>
                      <p className="text-blue-900">{selectedAMC.clientName}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Product</p>
                      <p className="text-blue-900">{selectedAMC.product}</p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Scheduled Date</p>
                      <p className="text-blue-900">
                        {new Date(selectedVisit.scheduledDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700 font-medium">Visit Number</p>
                      <p className="text-blue-900">
                        {selectedVisit.visitNumber} of {selectedAMC.visitsPerYear}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedVisit && rescheduleForm.newDate ? (
                  // Reschedule Form
                  <form onSubmit={handleRescheduleVisit} className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Reschedule Visit</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={rescheduleForm.newDate}
                        onChange={(e) => setRescheduleForm({...rescheduleForm, newDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Rescheduling *
                      </label>
                      <textarea
                        required
                        value={rescheduleForm.reason}
                        onChange={(e) => setRescheduleForm({...rescheduleForm, reason: e.target.value})}
                        placeholder="Enter reason for rescheduling..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Reschedule Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRescheduleForm({ newDate: '', reason: '' });
                          setSelectedVisit(null);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  // Visit Completion Form
                  <form onSubmit={handleCompleteVisit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Completion Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={visitForm.completedDate}
                        onChange={(e) => setVisitForm({...visitForm, completedDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Services Performed *
                      </label>
                      <textarea
                        required
                        value={visitForm.servicesPerformed}
                        onChange={(e) => setVisitForm({...visitForm, servicesPerformed: e.target.value})}
                        placeholder="Describe services performed during this visit..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visit Notes
                      </label>
                      <textarea
                        value={visitForm.notes}
                        onChange={(e) => setVisitForm({...visitForm, notes: e.target.value})}
                        placeholder="Any additional notes about the visit..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Customer Feedback
                      </label>
                      <textarea
                        value={visitForm.feedback}
                        onChange={(e) => setVisitForm({...visitForm, feedback: e.target.value})}
                        placeholder="Customer feedback or comments..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                      />
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <span className="font-semibold">Note:</span> This will mark the visit as completed 
                        and update the AMC progress.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Complete Visit
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVisitModal(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AMCDashboard;