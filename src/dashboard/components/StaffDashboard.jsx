
import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Edit2, ChevronLeft, ChevronRight, Target, CheckCircle, TrendingUp, Calendar, MapPin, Phone, Clock, ExternalLink, FileText } from 'lucide-react';
import { getAllLeads, getMyLeads, updateLead, } from '../../api/leadapi';
import { useSelector } from 'react-redux';

const StaffDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [filters, setFilters] = useState({ 
    search: '', 
    stage: '', 
    leadStatus: '',
    limit: 10 
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    locationLink: '',
    scheduleVisit: '',
    statusUpdates: '',
    stage: 'new',
    finished: {
      leadStatus: '',
      quoteSent: false,
      suggestedProducts: '',
      notes: ''
    },
    moveToInstallation: false // NEW: Add this field
  });

  // Fetch leads assigned to this staff member
//  const fetchLeads = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       const params = {
//         page: currentPage,
//         limit: filters.limit,
//         ...(filters.search && { search: filters.search }),
//         ...(filters.stage && { stage: filters.stage })
//       };
//       const response = await getAllLeads(token, params);
//       // Filter only leads assigned to current user
//       const myLeads = response.data.filter(lead => 
//         lead.assignedTo?._id === user?._id || lead.assignedTo === user?._id
//       );
//       setLeads(myLeads);
//       setTotalLeads(myLeads.length);
//       setTotalPages(Math.ceil(myLeads.length / filters.limit));
//     } catch (err) {
//       setError(err.message || 'Failed to fetch leads');
//     } finally {
//       setLoading(false);
//     } 
//   };
// Fetch leads assigned to this staff member

// Fetch leads assigned to this staff member
const fetchLeads = async () => {
  try {
    setLoading(true);
    setError('');
    
    // Prepare filters for API
    const apiFilters = {
      ...(filters.search && { search: filters.search }),
      ...(filters.leadStatus && { leadStatus: filters.leadStatus }),
    };
    
    // Use getMyLeads API for fetching staff's assigned leads
    const response = await getMyLeads(token, apiFilters);
    setLeads(response.data);
    setTotalLeads(response.total);
    setTotalPages(Math.ceil(response.total / filters.limit));
  } catch (err) {
    setError(err.message || 'Failed to fetch leads');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchLeads();
  }, [currentPage, filters]);

  // Filter leads based on active tab
  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return lead.stage === 'new';
    if (activeTab === 'scheduled') return lead.stage === 'scheduled';
    if (activeTab === 'finished') return lead.stage === 'finished';
    return true;
  });

  // Handle update lead
  // const handleUpdateLead = async (e) => {
  //   e.preventDefault();
    
  //   if (!formData.name || !formData.stage) {
  //     setError('Name and Stage are required');
  //     return;
  //   }
    
  //   try {
  //     setLoading(true);
  //     setError('');
      
  //     const updateData = {
  //       name: formData.name,
  //       contact: formData.contact,
  //       location: formData.location,
  //       locationLink: formData.locationLink,
  //       scheduleVisit: formData.scheduleVisit,
  //       statusUpdates: formData.statusUpdates,
  //       stage: formData.stage,
  //       ...(formData.stage === 'finished' && {
  //         finished: {
  //           leadStatus: formData.finished.leadStatus,
  //           quoteSent: formData.finished.quoteSent,
  //           suggestedProducts: formData.finished.suggestedProducts,
  //           notes: formData.finished.notes
  //         }
  //       })
  //     };

  //     await updateLead(selectedLead._id, updateData, token);
  //     setSuccess('Lead updated successfully!');
  //     setShowEditModal(false);
  //     resetForm();
  //     fetchLeads();
  //     setTimeout(() => setSuccess(''), 3000);
  //   } catch (err) {
  //     setError(err.message || 'Failed to update lead');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleUpdateLead = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.stage) {
      setError('Name and Stage are required');
      return;
    }

    // Validation: moveToInstallation only for finished leads
    if (formData.moveToInstallation && formData.stage !== 'finished') {
      setError('Only finished leads can be moved to installation');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const updateData = {
        name: formData.name,
        contact: formData.contact,
        location: formData.location,
        locationLink: formData.locationLink,
        scheduleVisit: formData.scheduleVisit,
        statusUpdates: formData.statusUpdates,
        stage: formData.stage,
        ...(formData.stage === 'finished' && {
          finished: {
            leadStatus: formData.finished.leadStatus,
            quoteSent: formData.finished.quoteSent,
            suggestedProducts: formData.finished.suggestedProducts,
            notes: formData.finished.notes
          },
          moveToInstallation: formData.moveToInstallation // NEW: Include this field
        })
      };

      await updateLead(selectedLead._id, updateData, token);
      setSuccess('Lead updated successfully!');
      setShowEditModal(false);
      resetForm();
      fetchLeads();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update lead');
    } finally {
      setLoading(false);
    }
  };


  // Open edit modal
  const openEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      contact: lead.contact || '',
      location: lead.location || '',
      locationLink: lead.locationLink || '',
      scheduleVisit: lead.scheduleVisit ? new Date(lead.scheduleVisit).toISOString().slice(0, 16) : '',
      statusUpdates: lead.statusUpdates || '',
      stage: lead.stage || 'new',
      finished: {
        leadStatus: lead.finished?.leadStatus || '',
        quoteSent: lead.finished?.quoteSent || false,
        suggestedProducts: lead.finished?.suggestedProducts || '',
        notes: lead.finished?.notes || ''
      },
      moveToInstallation: lead.moveToInstallation || false // NEW: Load existin
    });
    setShowEditModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      location: '',
      locationLink: '',
      scheduleVisit: '',
      statusUpdates: '',
      stage: 'new',
      finished: {
        leadStatus: '',
        quoteSent: false,
        suggestedProducts: '',
        notes: ''
      },
      moveToInstallation: false
    });
    setSelectedLead(null);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ search: '', stage: '', limit: 10, leadStatus: '', });
    setCurrentPage(1);
  };

  // Get stage configuration
  const getStageConfig = (stage) => {
    const configs = {
      new: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        border: 'border-blue-200',
        icon: Target
      },
      scheduled: { 
        bg: 'bg-purple-100', 
        text: 'text-purple-700', 
        border: 'border-purple-200',
        icon: Clock
      },
      finished: { 
        bg: 'bg-green-100', 
        text: 'text-green-700', 
        border: 'border-green-200',
        icon: CheckCircle
      }
    };
    return configs[stage] || configs.new;
  };

  // Stats
  const stats = [
    { 
      label: 'Total Leads', 
      value: leads.length, 
      color: 'from-blue-500 to-blue-600', 
      emoji: '📋' 
    },
    { 
      label: 'New', 
      value: leads.filter(l => l.stage === 'new').length, 
      color: 'from-purple-500 to-purple-600', 
      emoji: '🎯' 
    },
    { 
      label: 'Scheduled', 
      value: leads.filter(l => l.stage === 'scheduled').length, 
      color: 'from-amber-500 to-amber-600', 
      emoji: '📅' 
    },
    { 
      label: 'Finished', 
      value: leads.filter(l => l.stage === 'finished').length, 
      color: 'from-green-500 to-green-600', 
      emoji: '✅' 
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 lg:pl-64 mt-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl mb-8 rounded-b-3xl lg:pl-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                Hey {user?.name || 'Staff'} 👋
              </h1>
              <p className="text-indigo-100 mt-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Manage your assigned leads
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-6xl opacity-20">🚀</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-md">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✨</span>
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className={`bg-gradient-to-br ${stat.color} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm font-medium mb-1">{stat.label}</p>
                    <h3 className="text-4xl font-bold text-white">{stat.value}</h3>
                  </div>
                  <div className="text-5xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {stat.emoji}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
{/* Tabs */}
<div className="bg-white border border-gray-200 rounded-lg mb-6">
  <div className="flex border-b border-gray-200 overflow-x-auto">
    <button
      onClick={() => setActiveTab('all')}
      className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
        activeTab === 'all'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      All Leads ({leads.length})
    </button>
    <button
      onClick={() => setActiveTab('new')}
      className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
        activeTab === 'new'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      New ({leads.filter(l => l.stage === 'new').length})
    </button>
    <button
      onClick={() => setActiveTab('scheduled')}
      className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
        activeTab === 'scheduled'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      Scheduled ({leads.filter(l => l.stage === 'scheduled').length})
    </button>
    <button
      onClick={() => setActiveTab('finished')}
      className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
        activeTab === 'finished'
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      Finished ({leads.filter(l => l.stage === 'finished').length})
    </button>
  </div>
</div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="search"
                placeholder="Search by name or contact..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            {/* <select
              name="stage"
              value={filters.stage}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="">All Stages</option>
              <option value="new">New</option>
              <option value="scheduled">Scheduled</option>
              <option value="finished">Finished</option>
            </select> */}
             <select
      name="leadStatus"
      value={filters.leadStatus}
      onChange={handleFilterChange}
      className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
    >
      <option value="">All Lead Status</option>
      <option value="Hot">Hot</option>
      <option value="Warm">Warm</option>
      <option value="Cold">Cold</option>
    </select>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
            <button
              onClick={clearFilters}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin text-6xl mb-4">⏳</div>
              <p className="text-gray-500 text-lg font-medium">Loading your leads...</p>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-8xl mb-4 opacity-50">📭</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No leads found</h3>
              <p className="text-gray-500">No {activeTab} leads assigned to you</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-200">
  <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
  Sl.No
</th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Location</th>
    {(activeTab === 'scheduled' || activeTab === 'all') && (
      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Visit Date</th>
    )}
    {(activeTab === 'finished' || activeTab === 'all') && (
      <>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lead Status</th>
        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quote</th>
      </>
    )}
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stage</th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Created</th>
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
  </tr>
</thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLeads.map((lead) => {
                      const stageConfig = getStageConfig(lead.stage);
                      const StageIcon = stageConfig.icon;
                      return (
                        <tr key={lead._id} className="hover:bg-indigo-50/50 transition-colors">
                                                  <td className="px-6 py-4">
  <div className="text-sm font-medium text-gray-700">
    {(currentPage - 1) * filters.limit + filteredLeads.indexOf(lead) + 1}
  </div>
</td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{lead.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            {lead.contact ? (
                             <a
  href={`https://wa.me/91${lead.contact.replace(/\D/g, '')}?text=Hello ${encodeURIComponent(lead.name)}`}
  target="_blank"
  rel="noopener noreferrer"
  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
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
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{lead.location || '—'}</span>
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
                          {/* {activeTab === 'scheduled' && (
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {lead.scheduleVisit ? new Date(lead.scheduleVisit).toLocaleString() : '—'}
                              </div>
                            </td>
                          )}
                          {activeTab === 'finished' && (
                            <>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  lead.finished?.leadStatus === 'Hot' ? 'bg-red-100 text-red-700' :
                                  lead.finished?.leadStatus === 'Warm' ? 'bg-orange-100 text-orange-700' :
                                  lead.finished?.leadStatus === 'Cold' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {lead.finished?.leadStatus || '—'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`text-sm font-medium ${
                                  lead.finished?.quoteSent ? 'text-green-600' : 'text-gray-400'
                                }`}>
                                  {lead.finished?.quoteSent ? 'Sent' : 'Not Sent'}
                                </span>
                              </td>
                            </>
                          )} */}

                          {(activeTab === 'scheduled' || activeTab === 'all') && (
  <td className="px-6 py-4">
    <div className="flex items-center gap-2 text-gray-600">
      <Clock className="w-4 h-4 text-gray-400" />
      {lead.scheduleVisit ? new Date(lead.scheduleVisit).toLocaleString() : '—'}
    </div>
  </td>
)}
{(activeTab === 'finished' || activeTab === 'all') && (
  <>
    <td className="px-6 py-4">
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
        lead.finished?.leadStatus === 'Hot' ? 'bg-red-100 text-red-700' :
        lead.finished?.leadStatus === 'Warm' ? 'bg-orange-100 text-orange-700' :
        lead.finished?.leadStatus === 'Cold' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {lead.finished?.leadStatus || '—'}
      </span>
    </td>
    <td className="px-6 py-4">
      <span className={`text-sm font-medium ${
        lead.finished?.quoteSent ? 'text-green-600' : 'text-gray-400'
      }`}>
        {lead.finished?.quoteSent ? 'Sent' : 'Not Sent'}
      </span>
    </td>
  </>
)}
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stageConfig.bg} ${stageConfig.text} border ${stageConfig.border}`}>
                              <StageIcon className="w-3.5 h-3.5" />
                              {lead.stage}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                              <Calendar className="w-4 h-4" />
                              {new Date(lead.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openEditModal(lead)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="text-gray-700 font-medium">
                    Page <span className="text-indigo-600 font-bold">{currentPage}</span> of {totalPages}
                    <span className="text-gray-500 ml-2">({filteredLeads.length} leads)</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Edit2 className="w-6 h-6" />
                  Update Lead
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleUpdateLead} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="Phone number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City or address"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location Link</label>
                  <input
                    type="url"
                    value={formData.locationLink}
                    onChange={(e) => setFormData({ ...formData, locationLink: e.target.value })}
                    placeholder="Google Maps URL"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Schedule Visit</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduleVisit}
                    onChange={(e) => setFormData({ ...formData, scheduleVisit: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Stage *</label>
                  <select
                    required
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="new">New</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="finished">Finished</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status Updates</label>
                <textarea
                  rows="3"
                  value={formData.statusUpdates}
                  onChange={(e) => setFormData({ ...formData, statusUpdates: e.target.value })}
                  placeholder="Add notes about this lead..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Finished Stage Fields */}
              {/* {formData.stage === 'finished' && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-900">Finished Lead Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Status</label>
                      <select
                        value={formData.finished.leadStatus}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          finished: { ...formData.finished, leadStatus: e.target.value }
                        })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select Status</option>
                        <option value="Hot">Hot</option>
                        <option value="Warm">Warm</option>
                        <option value="Cold">Cold</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={formData.finished.quoteSent}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            finished: { ...formData.finished, quoteSent: e.target.checked }
                          })}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        Quote Sent
                      </label>
                    </div>
                  </div>
                  <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">Suggested Products</label>
  <textarea
    rows="3"
    value={formData.finished.suggestedProducts}
    onChange={(e) => setFormData({ 
      ...formData, 
      finished: { ...formData.finished, suggestedProducts: e.target.value } 
    })}
    placeholder="List the products you suggested to this lead..."
    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
  />
</div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      rows="3"
                      value={formData.finished.notes}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        finished: { ...formData.finished, notes: e.target.value }
                      })}
                      placeholder="Additional notes about the finished lead..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )} */}
              {formData.stage === 'finished' && (
  <div className="border-t pt-4 space-y-4">
    <h3 className="font-semibold text-gray-900">Finished Lead Details</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Lead Status</label>
        <select
          value={formData.finished.leadStatus}
          onChange={(e) => setFormData({ ...formData, finished: { ...formData.finished, leadStatus: e.target.value } })}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        >
          <option value="">Select Status</option>
          <option value="Hot">Hot</option>
          <option value="Warm">Warm</option>
          <option value="Cold">Cold</option>
        </select>
      </div>
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
          <input
            type="checkbox"
            checked={formData.finished.quoteSent}
            onChange={(e) => setFormData({ ...formData, finished: { ...formData.finished, quoteSent: e.target.checked } })}
            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          Quote Sent
        </label>
      </div>
    </div>
    {/* 👇 ADD THIS NEW SECTION */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Suggested Products</label>
      <textarea
        rows="3"
        value={formData.finished.suggestedProducts}
        onChange={(e) => setFormData({ ...formData, finished: { ...formData.finished, suggestedProducts: e.target.value } })}
        placeholder="List the products you suggested to this lead..."
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    {/* 👆 END OF NEW SECTION */}
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
      <textarea
        rows="3"
        value={formData.finished.notes}
        onChange={(e) => setFormData({ ...formData, finished: { ...formData.finished, notes: e.target.value } })}
        placeholder="Additional notes about the finished lead..."
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.moveToInstallation}
                          onChange={(e) => setFormData({ ...formData, moveToInstallation: e.target.checked })}
                          disabled={selectedLead?.moveToInstallation} // Disable if already moved
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
  </div>
)}

              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '⏳ Updating...' : '✨ Update Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;