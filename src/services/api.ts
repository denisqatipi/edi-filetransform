import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth endpoints
export const api = {
  async register(data: { email: string; password: string; name: string }) {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async login(data: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
  },

  // File upload endpoints
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async uploadJsonFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload/json', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Channel operations
  async getChannels() {
    const response = await apiClient.get('/channels');
    return response.data;
  },

  async createChannel(data: {
    name: string;
    description?: string;
    sourceFormat: string;
    targetFormat: string;
    sourceTemplate: any;
    targetTemplate: any;
    mappings: any[];
  }) {
    const response = await apiClient.post('/channels', data);
    return response.data;
  },

  async transformWithChannel(channelId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/channels/${channelId}/transform`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }
};