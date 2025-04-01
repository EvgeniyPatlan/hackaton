import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:80/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для додавання токена авторизації
api.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if ((session as any)?.accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обробки помилок
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Якщо помилка 401 (неавторизований) і це не повторний запит
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Спробувати оновити токен
        const session = await getSession();
        if ((session as any)?.refreshToken) {
          const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: (session as any).refreshToken,
          });
          
          // Оновити сесію
          // В реальному застосунку тут треба оновити сесію в next-auth
          
          // Повторити оригінальний запит з новим токеном
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Якщо не вдалося оновити токен, перенаправити на сторінку входу
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Типізовані функції для API запитів
export const authApi = {
  signup: (data: any) => api.post('/auth/register', data),
  signin: (data: any) => api.post('/auth/login', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

export const userApi = {
  getProfile: (userId: string) => api.get(`/users/${userId}`),
  updateProfile: (userId: string, data: any) => api.put(`/users/${userId}`, data),
  updatePreferences: (data: any) => api.put('/preferences', data),
};

export const locationsApi = {
  getAll: (params?: any) => api.get('/locations', { params }),
  getById: (id: string) => api.get(`/locations/${id}`),
  create: (data: any) => api.post('/locations', data),
  update: (id: string, data: any) => api.put(`/locations/${id}`, data),
  getFeatures: () => api.get('/locations/features'),
  addReview: (locationId: string, data: any) => api.post(`/locations/${locationId}/reviews`, data),
};

export const filesApi = {
  upload: (formData: FormData) =>
    api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getFile: (fileId: string) => `${API_URL}/files/${fileId}`,
};

export const moderationApi = {
  submitForModeration: (data: any) => api.post('/moderation/submit', data),
  getPendingItems: (params?: any) => api.get('/moderation', { params }),
  moderateItem: (id: string, data: any) => api.put(`/moderation/${id}`, data),
  createReport: (data: any) => api.post('/reports', data),
};

export const notificationsApi = {
  getAll: (params?: any) => api.get('/notifications/my', { params }),
  markAsRead: (id: string) => api.post(`/notifications/read/${id}`),
  markAllAsRead: () => api.post('/notifications/read-all'),
};
