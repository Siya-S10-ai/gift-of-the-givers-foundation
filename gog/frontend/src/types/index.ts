export interface User {
  userId: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  phone: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  role: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  surname: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

export interface IncidentReport {
  reportId: number;
  userId: string;
  description: string;
  location: string;
  reportType: string;
  imageUrl?: string;
  createdAt: string;
  userName: string;
}

export interface CreateIncidentReportRequest {
  description: string;
  location: string;
  reportType: string;
  image?: File;
}

export interface Task {
  taskId: number;
  description: string;
  status: string;
  volunteerId?: string;
  category: string;
  createdAt: string;
  volunteerName?: string;
}

export interface CreateTaskRequest {
  description: string;
  category: string;
}

export interface AssignTaskRequest {
  volunteerId: string;
}

export interface Donation {
  donationId: number;
  category: string;
  amount: number;
  transactionReference: string;
  userId: string;
  createdAt: string;
  userName: string;
}

export interface CreateDonationRequest {
  category: string;
  amount: number;
  transactionReference: string;
}

export interface PaymentIntentRequest {
  amount: number;
  category: string;
  currency: string;
}
