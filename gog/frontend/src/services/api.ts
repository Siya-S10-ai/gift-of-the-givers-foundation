import axios from 'axios';
import { 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  User, 
  IncidentReport, 
  CreateIncidentReportRequest,
  Task,
  CreateTaskRequest,
  AssignTaskRequest,
  Donation,
  CreateDonationRequest,
  PaymentIntentRequest
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'localhost:5211';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', data);
    return response.data;
  },
};

// Incident Reports API
export const incidentReportsAPI = {
  getAll: async (): Promise<IncidentReport[]> => {
    const response = await api.get('/incidentreports');
    return response.data;
  },

  getById: async (id: number): Promise<IncidentReport> => {
    const response = await api.get(`/incidentreports/${id}`);
    return response.data;
  },

  create: async (data: CreateIncidentReportRequest): Promise<IncidentReport> => {
    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('location', data.location);
    formData.append('reportType', data.reportType);
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await api.post('/incidentreports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: number, data: Partial<CreateIncidentReportRequest>): Promise<void> => {
    await api.put(`/incidentreports/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/incidentreports/${id}`);
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (): Promise<Task[]> => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getById: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateTaskRequest>): Promise<void> => {
    await api.put(`/tasks/${id}`, data);
  },

  assign: async (id: number, data: AssignTaskRequest): Promise<void> => {
    await api.post(`/tasks/${id}/assign`, data);
  },

  complete: async (id: number): Promise<void> => {
    await api.post(`/tasks/${id}/complete`);
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

// Donations API
export const donationsAPI = {
  getAll: async (): Promise<Donation[]> => {
    const response = await api.get('/donations');
    return response.data;
  },

  getById: async (id: number): Promise<Donation> => {
    const response = await api.get(`/donations/${id}`);
    return response.data;
  },

  create: async (data: CreateDonationRequest): Promise<Donation> => {
    const response = await api.post('/donations', data);
    return response.data;
  },

  getUserDonations: async (userId: string): Promise<Donation[]> => {
    const response = await api.get(`/donations/user/${userId}`);
    return response.data;
  },

  getStatistics: async (): Promise<any> => {
    const response = await api.get('/donations/statistics');
    return response.data;
  },
};

export default api;
