import React, { useState, useEffect } from 'react';
import { Heart, Users, ClipboardList, CheckCircle2, Clock4, Search, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import donorRequestStore from '../store/donorRequestStore.js';
import recipientRequestStore from '../store/recipientRequestStore.js';

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Get store functions
  const { 
    getAllDonorRequests, 
    confirmDonorRequest, 
    donorRequests: donorReqs, 
    isLoading: donorLoading 
  } = donorRequestStore();
  
  const { 
    getAllRecipientRequests, 
    confirmRecipientRequest, 
    recipientRequests: recipientReqs, 
    isLoading: recipientLoading 
  } = recipientRequestStore();

  // Stats data
  const stats = [
    { 
      label: 'Total Donors', 
      value: (Array.isArray(donorReqs) ? donorReqs : (donorReqs?.docs || [])).length, 
      icon: Heart, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50' 
    },
    { 
      label: 'Total Patients', 
      value: (Array.isArray(recipientReqs) ? recipientReqs : (recipientReqs?.docs || [])).length, 
      icon: Users, 
      color: 'text-green-600', 
      bg: 'bg-green-50' 
    },
    { 
      label: 'Pending Review', 
      value: [...(Array.isArray(donorReqs) ? donorReqs : (donorReqs?.docs || [])), ...(Array.isArray(recipientReqs) ? recipientReqs : (recipientReqs?.docs || []))].filter(req => 
        req.adminConfirmation === 'pending').length, 
      icon: Clock4, 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50' 
    },
    { 
      label: 'Approved', 
      value: [...donorReqs, ...recipientReqs].filter(req => 
        req.adminConfirmation === 'approved').length, 
      icon: CheckCircle2, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50' 
    },
  ];

  // Fetch data on component mount
  useEffect(() => {
    getAllDonorRequests();
    getAllRecipientRequests();
  }, [getAllDonorRequests, getAllRecipientRequests]);

  // Handle approval
  const handleApprove = async (id, type) => {
    try {
      if (type === 'donor') {
        await confirmDonorRequest(id, 'approved');
        await getAllDonorRequests(); // Refresh data
      } else {
        await confirmRecipientRequest(id, 'approved');
        await getAllRecipientRequests(); // Refresh data
      }
    } catch (error) {
      console.error('Approval error:', error);
    }
  };

  // Handle rejection
  const handleReject = async (id, type) => {
    try {
      if (type === 'donor') {
        await confirmDonorRequest(id, 'rejected');
        await getAllDonorRequests(); // Refresh data
      } else {
        await confirmRecipientRequest(id, 'rejected');
        await getAllRecipientRequests(); // Refresh data
      }
    } catch (error) {
      console.error('Rejection error:', error);
    }
  };

  // Combine and filter applications
  const allApplications = [
    ...(Array.isArray(donorReqs) ? donorReqs : (donorReqs?.docs || [])).map(req => ({
      id: req._id,
      name: req.fullName || req.doner?.user?.fullName || req.recipient?.user?.fullName || "User",
      email: req.email || req.doner?.user?.email || req.recipient?.user?.email || "N/A",
      type: 'donor',
      organ: req.organ || req.organType?.type || "Organ",
      blood: req.bloodGroup || req.doner?.bloodGroup || req.recipient?.bloodGroup || "-",
      age: req.age || req.doner?.age || req.recipient?.age || "-",
      urgency: '-',
      status: req.adminConfirmation || 'Submitted',
      original: req
    })),
    ...(Array.isArray(recipientReqs) ? recipientReqs : (recipientReqs?.docs || [])).map(req => ({
      id: req._id,
      name: req.fullName || req.doner?.user?.fullName || req.recipient?.user?.fullName || "User",
      email: req.email || req.doner?.user?.email || req.recipient?.user?.email || "N/A",
      type: 'patient',
      organ: req.organ || req.organType?.type || "Organ",
      blood: req.bloodGroup || req.doner?.bloodGroup || req.recipient?.bloodGroup || "-",
      age: req.age || req.doner?.age || req.recipient?.age || "-",
      urgency: req.urgencyLevel || req.urgency || "Medium",
      status: req.adminConfirmation || 'Submitted',
      original: req
    }))
  ];

  // Filter applications based on search and filters
  const filteredApplications = allApplications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && app.status === 'pending') ||
      (statusFilter === 'approved' && app.status === 'approved') ||
      (statusFilter === 'rejected' && app.status === 'rejected');
    
    const matchesType = 
      typeFilter === 'all' || 
      (typeFilter === 'donor' && app.type === 'donor') ||
      (typeFilter === 'patient' && app.type === 'patient');
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 rounded-lg p-2 mr-3">
              <Heart className="w-6 h-6 text-white" fill="currentColor" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">OrganMatch</h2>
              <p className="text-sm text-gray-600">Admin</p>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-medium text-gray-800">Admin Panel</h3>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button className="w-full flex items-center px-4 py-3 text-left bg-blue-500 text-white rounded-lg font-medium">Dashboard</button>
          <button className="w-full flex items-center px-4 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg">Profile</button>
          <button className="w-full flex items-center px-4 py-3 text-left text-gray-600 hover:bg-gray-100 rounded-lg">Application Status</button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Top header */}
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full mr-3">
            <ClipboardList className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage donors, patients, and organ matching</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className={`bg-white rounded-xl shadow-sm p-6 flex items-center justify-between`}>
                <div>
                  <p className="text-sm text-gray-600">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
                </div>
                <div className={`${s.bg} ${s.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Applications Management */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center mb-6">
            <div className="bg-gray-100 p-2 rounded-lg mr-3">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Applications Management</h2>
              <p className="text-sm text-gray-600">Review and approve donor and patient applications</p>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" 
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="donor">Donor</option>
                <option value="patient">Patient</option>
              </select>
            </div>
          </div>

          {/* Loading state */}
          {(donorLoading || recipientLoading) && (
            <div className="text-center py-8">
              <p>Loading applications...</p>
            </div>
          )}

          {/* Table */}
          {!donorLoading && !recipientLoading && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="text-sm text-gray-600">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Organ</th>
                    <th className="py-3 px-4 font-medium">Blood Group</th>
                    <th className="py-3 px-4 font-medium">Age</th>
                    <th className="py-3 px-4 font-medium">Urgency</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApplications.map((a) => (
                    <tr key={a.id} className="text-sm text-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium">{a.name}</div>
                        <div className="text-gray-500">{a.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.type === 'donor' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {a.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">{a.organ}</td>
                      <td className="py-3 px-4">{a.blood}</td>
                      <td className="py-3 px-4">{a.age}</td>
                      <td className="py-3 px-4">
                        {a.urgency === '-' ? '-' : (
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            a.urgency === 'High' ? 'bg-red-100 text-red-700' : 
                            a.urgency === 'Medium' ? 'bg-orange-100 text-orange-700' : 
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {a.urgency}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          a.status === 'pending' || a.status === 'Submitted' ? 'bg-yellow-100 text-yellow-800' : 
                          a.status === 'approved' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleApprove(a.id, a.type)}
                            disabled={a.status === 'approved'}
                            className={`flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                              a.status === 'approved' 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" /> 
                            {a.status === 'approved' ? 'Approved' : 'Approve'}
                          </button>
                          <button 
                            onClick={() => handleReject(a.id, a.type)}
                            disabled={a.status === 'rejected'}
                            className={`flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                              a.status === 'rejected' 
                                ? 'bg-gray-400 text-white cursor-not-allowed' 
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                          >
                            <XCircle className="w-3 h-3 mr-1" /> 
                            {a.status === 'rejected' ? 'Rejected' : 'Reject'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No applications found matching your criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;