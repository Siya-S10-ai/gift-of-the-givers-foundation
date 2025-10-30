import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { incidentReportsAPI, tasksAPI, donationsAPI } from '../services/api';
import { IncidentReport, Task, Donation } from '../types';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports' | 'tasks' | 'donations'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [statistics, setStatistics] = useState<any>(null);

  // Filter states
  const [reportFilter, setReportFilter] = useState<string>('');
  const [taskFilter, setTaskFilter] = useState<string>('');
  const [donationFilter, setDonationFilter] = useState<string>('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [reportsData, tasksData, donationsData, statsData] = await Promise.all([
        incidentReportsAPI.getAll(),
        tasksAPI.getAll(),
        donationsAPI.getAll(),
        donationsAPI.getStatistics()
      ]);
      
      setReports(reportsData);
      setTasks(tasksData);
      setDonations(donationsData);
      setStatistics(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await incidentReportsAPI.delete(reportId);
      setReports(reports.filter(r => r.reportId !== reportId));
      setSuccess('Report deleted successfully');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete report');
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await tasksAPI.delete(taskId);
      setTasks(tasks.filter(t => t.taskId !== taskId));
      setSuccess('Task deleted successfully');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleCreateTask = async (description: string, category: string) => {
    try {
      const newTask = await tasksAPI.create({ description, category });
      setTasks([...tasks, newTask]);
      setSuccess('Task created successfully');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create task');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'Assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Natural Disaster': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-blue-100 text-blue-800',
      'Education': 'bg-green-100 text-green-800',
      'Human Development': 'bg-purple-100 text-purple-800',
      'Water Provision': 'bg-cyan-100 text-cyan-800',
      'Hunger Alleviation': 'bg-orange-100 text-orange-800',
      'Food': 'bg-orange-100 text-orange-800',
      'Clothing': 'bg-blue-100 text-blue-800',
      'Medical Supplies': 'bg-red-100 text-red-800',
      'Emergency Relief': 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'reports', name: 'Reports', icon: '📝' },
              { id: 'tasks', name: 'Tasks', icon: '📋' },
              { id: 'donations', name: 'Donations', icon: '💰' },
              { id: 'users', name: 'Users', icon: '👥' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{reports.length}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-blue-100 text-sm">Total Reports</p>
                      <p className="text-white text-2xl font-bold">{reports.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{tasks.length}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-green-100 text-sm">Total Tasks</p>
                      <p className="text-white text-2xl font-bold">{tasks.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{donations.length}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-purple-100 text-sm">Total Donations</p>
                      <p className="text-white text-2xl font-bold">{donations.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">R{statistics?.totalAmount?.toFixed(0) || '0'}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-orange-100 text-sm">Total Raised</p>
                      <p className="text-white text-2xl font-bold">{formatCurrency(statistics?.totalAmount || 0)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.reportId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{report.location}</p>
                          <p className="text-sm text-gray-500">{report.reportType}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(report.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Donations</h3>
                  <div className="space-y-3">
                    {donations.slice(0, 5).map((donation) => (
                      <div key={donation.donationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{formatCurrency(donation.amount)}</p>
                          <p className="text-sm text-gray-500">{donation.category}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(donation.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Incident Reports</h2>
                <div className="flex space-x-2">
                  <select
                    value={reportFilter}
                    onChange={(e) => setReportFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Natural Disaster">Natural Disaster</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Human Development">Human Development</option>
                    <option value="Water Provision">Water Provision</option>
                    <option value="Hunger Alleviation">Hunger Alleviation</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {reports
                  .filter(report => !reportFilter || report.reportType === reportFilter)
                  .map((report) => (
                    <div key={report.reportId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.reportType)}`}>
                              {report.reportType}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(report.createdAt)}
                            </span>
                            <span className="text-sm text-gray-500">
                              by {report.userName}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{report.location}</h3>
                          <p className="text-gray-600 text-sm mb-3">{report.description}</p>
                          {report.imageUrl && (
                            <img
                              src={report.imageUrl}
                              alt="Report"
                              className="w-32 h-32 object-cover rounded-md"
                            />
                          )}
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <button
                            onClick={() => handleDeleteReport(report.reportId)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Task Management</h2>
                <div className="flex space-x-2">
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Natural Disaster">Natural Disaster</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="Human Development">Human Development</option>
                    <option value="Water Provision">Water Provision</option>
                    <option value="Hunger Alleviation">Hunger Alleviation</option>
                  </select>
                  <CreateTaskForm onCreateTask={handleCreateTask} />
                </div>
              </div>

              <div className="space-y-4">
                {tasks
                  .filter(task => !taskFilter || task.category === taskFilter)
                  .map((task) => (
                    <div key={task.taskId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                              {task.category}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(task.createdAt)}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">{task.description}</h3>
                          {task.volunteerName && (
                            <p className="text-sm text-gray-600">
                              Assigned to: {task.volunteerName}
                            </p>
                          )}
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <button
                            onClick={() => handleDeleteTask(task.taskId)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Donations Tab */}
          {activeTab === 'donations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Donation Management</h2>
                <div className="flex space-x-2">
                  <select
                    value={donationFilter}
                    onChange={(e) => setDonationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Education">Education</option>
                    <option value="Water">Water</option>
                    <option value="Emergency Relief">Emergency Relief</option>
                  </select>
                </div>
              </div>

              {/* Donation Statistics */}
              {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-900">Total Raised</h3>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(statistics.totalAmount)}</p>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-900">Total Donations</h3>
                    <p className="text-2xl font-bold text-green-600">{statistics.totalDonations}</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-purple-900">Average Donation</h3>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(statistics.totalAmount / statistics.totalDonations)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {donations
                  .filter(donation => !donationFilter || donation.category === donationFilter)
                  .map((donation) => (
                    <div key={donation.donationId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(donation.category)}`}>
                              {donation.category}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(donation.createdAt)}
                            </span>
                            <span className="text-sm text-gray-500">
                              by {donation.userName}
                            </span>
                          </div>
                          <h3 className="font-medium text-gray-900 mb-1">
                            {formatCurrency(donation.amount)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Transaction: {donation.transactionReference}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">User Management</h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">User Management</h3>
                <p className="text-yellow-800 mb-4">
                  User management functionality requires additional backend endpoints to be implemented.
                  This would include:
                </p>
                <ul className="list-disc list-inside text-yellow-800 space-y-1">
                  <li>View all users with their roles and registration dates</li>
                  <li>Edit user profiles and roles</li>
                  <li>Suspend or activate user accounts</li>
                  <li>View user activity and statistics</li>
                  <li>Send notifications to users</li>
                </ul>
                <p className="text-yellow-800 mt-4">
                  <strong>Note:</strong> This feature requires extending the backend API with user management endpoints.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Create Task Form Component
const CreateTaskForm: React.FC<{ onCreateTask: (description: string, category: string) => void }> = ({ onCreateTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && category) {
      onCreateTask(description, category);
      setDescription('');
      setCategory('');
      setIsOpen(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Create Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Task description"
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      >
        <option value="">Select Category</option>
        <option value="Natural Disaster">Natural Disaster</option>
        <option value="Healthcare">Healthcare</option>
        <option value="Education">Education</option>
        <option value="Human Development">Human Development</option>
        <option value="Water Provision">Water Provision</option>
        <option value="Hunger Alleviation">Hunger Alleviation</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
      >
        Create
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
      >
        Cancel
      </button>
    </form>
  );
};

export default AdminDashboard;
