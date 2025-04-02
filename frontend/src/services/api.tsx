// src/services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store'

// Define types for the API
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  }
}

export interface Coordinates {
  x: number; // longitude
  y: number; // latitude
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  accessibilityFeatures?: string[];
  createdBy?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface CreateLocationRequest {
  name: string;
  address: string;
  coordinates?: Coordinates;
  accessibilityFeatures?: string[];
}

// Create the API
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api',
    prepareHeaders: (headers, { getState }) => {
      // Get token from state
      const token = (getState() as RootState).auth.token
      
      // Add authorization header if token exists
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      
      return headers
    },
  }),
  tagTypes: ['Locations', 'User'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    
    refreshToken: builder.mutation<LoginResponse, { refreshToken: string }>({
      query: (body) => ({
        url: '/auth/refresh',
        method: 'POST',
        body,
      }),
    }),
    
    // User profile endpoints
    getProfile: builder.query<any, void>({
      query: () => '/users/me',
      providesTags: ['User'],
    }),
    
    // Location endpoints
    getAllLocations: builder.query<Location[], void>({
      query: () => '/locations',
      providesTags: ['Locations'],
    }),
    
    getLocationById: builder.query<Location, string>({
      query: (id) => `/locations/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Locations', id }],
    }),
    
    getMyLocations: builder.query<Location[], void>({
      query: () => '/locations/by-user/me',
      providesTags: ['Locations'],
    }),
    
    createLocation: builder.mutation<Location, CreateLocationRequest>({
      query: (body) => ({
        url: '/locations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Locations'],
    }),
    
    updateLocation: builder.mutation<Location, Partial<Location> & { id: string }>({
      query: ({ id, ...body }) => ({
        url: `/locations/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Locations', id }, 
        'Locations'
      ],
    }),
    
    deleteLocation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Locations'],
    }),
    
    // Search endpoints
    searchLocations: builder.query<Location[], string>({
      query: (query) => `/locations/search?q=${encodeURIComponent(query)}`,
    }),
  }),
})

// Export hooks for usage in components
export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useGetProfileQuery,
  useGetAllLocationsQuery,
  useGetLocationByIdQuery,
  useGetMyLocationsQuery,
  useCreateLocationMutation,
  useUpdateLocationMutation,
  useDeleteLocationMutation,
  useSearchLocationsQuery,
} = api