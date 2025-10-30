import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tasksAPI } from '../services/api';
import { Task } from '../types';

const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState<number | null>(null);
  const [isCompleting, setIsCompleting] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    { id: '', name: 'All Categories', icon: '📋', color: 'bg-gray-100 text-gray-800' },
    { id: 'Natural Disaster', name: 'Natural Disaster', icon: '🌪️', color: 'bg-red-100 text-red-800' },
    { id: 'Healthcare', name: 'Healthcare', icon: '🏥', color: 'bg-blue-100 text-blue-800' },
    { id: 'Education', name: 'Education', icon: '🎓', color: 'bg-green-100 text-green-800' },
    { id: 'Human Development', name: 'Human Development', icon: '👥', color: 'bg-purple-100 text-purple-800' },
    { id: 'Water Provision', name: 'Water Provision', icon: '💧', color: 'bg-cyan-100 text-cyan-800' },
    { id: 'Hunger Alleviation', name: 'Hunger Alleviation', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await tasksAPI.getAll();
      setTasks(data);
      
      // Filter tasks assigned to current user
      const userTasks = data.filter(task => task.volunteerId === user?.userId);
      setMyTasks(userTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTask = async (taskId: number) => {
    if (!user?.userId) return;
    
    setIsAssigning(taskId);
    setError('');
    setSuccess('');

    try {
      await tasksAPI.assign(taskId, { volunteerId: user.userId });
      setSuccess('Task assigned successfully!');
      fetchTasks();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign task');
    } finally {
      setIsAssigning(null);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    setIsCompleting(taskId);
    setError('');
    setSuccess('');

    try {
      await tasksAPI.complete(taskId);
      setSuccess('Task completed successfully!');
      fetchTasks();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to complete task');
    } finally {
      setIsCompleting(null);
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

  const filteredTasks = selectedCategory 
    ? tasks.filter(task => task.category === selectedCategory)
    : tasks;

  const availableTasks = filteredTasks.filter(task => task.status === 'Available');
  const assignedTasks = filteredTasks.filter(task => task.status === 'Assigned' && task.volunteerId !== user?.userId);
  const completedTasks = myTasks.filter(task => task.status === 'Completed');

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
            <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.username}</p>
          </div>
          <button
            onClick={() => window.location.href = '/volunteer-dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Track My Contributions
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm font-bold">{availableTasks.length}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Available Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{availableTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">{myTasks.filter(t => t.status === 'Assigned').length}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">My Active Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{myTasks.filter(t => t.status === 'Assigned').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-bold">{completedTasks.length}</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Tasks</p>
              <p className="text-lg font-semibold text-gray-900">{completedTasks.length}</p>
            </div>
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

      {/* Category Filter */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Filter by Category</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? category.color
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Available Tasks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Available Tasks</h2>
        
        {availableTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <p className="text-gray-500">No available tasks</p>
            <p className="text-sm text-gray-400">Check back later for new opportunities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableTasks.map((task) => (
              <div key={task.taskId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        categories.find(c => c.id === task.category)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
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
                  </div>
                  <button
                    onClick={() => handleAssignTask(task.taskId)}
                    disabled={isAssigning === task.taskId}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isAssigning === task.taskId ? 'Assigning...' : 'Assign to Me'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Active Tasks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">My Active Tasks</h2>
        
        {myTasks.filter(t => t.status === 'Assigned').length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">⏳</div>
            <p className="text-gray-500">No active tasks</p>
            <p className="text-sm text-gray-400">Assign yourself to available tasks above</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myTasks.filter(t => t.status === 'Assigned').map((task) => (
              <div key={task.taskId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        categories.find(c => c.id === task.category)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
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
                  </div>
                  <button
                    onClick={() => handleCompleteTask(task.taskId)}
                    disabled={isCompleting === task.taskId}
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCompleting === task.taskId ? 'Completing...' : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Completed Tasks */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">My Completed Tasks</h2>
        
        {completedTasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 text-6xl mb-4">✅</div>
            <p className="text-gray-500">No completed tasks yet</p>
            <p className="text-sm text-gray-400">Complete your assigned tasks to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedTasks.map((task) => (
              <div key={task.taskId} className="border border-gray-200 rounded-lg p-4 bg-green-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        categories.find(c => c.id === task.category)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
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
                  </div>
                  <div className="ml-4 flex items-center text-green-600">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contribution Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Contribution Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <strong>Total Tasks Completed:</strong> {completedTasks.length}
          </div>
          <div>
            <strong>Active Tasks:</strong> {myTasks.filter(t => t.status === 'Assigned').length}
          </div>
          <div>
            <strong>Categories Contributed:</strong> {Array.from(new Set(completedTasks.map(t => t.category))).length}
          </div>
          <div>
            <strong>Volunteer Since:</strong> {user?.username ? 'Recently' : 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
