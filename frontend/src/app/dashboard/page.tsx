'use client'
import { useGetMyLocationsQuery } from '@/services/api'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'

// Import types
import type { Location } from '@/services/api'

// Dynamic import of the map component to avoid SSR issues
const DashboardMap = dynamic(() => import('@/components/map/DashboardMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
})

export default function DashboardPage() {
  const { t } = useTranslation()
  const { data: locations, isLoading, isError, refetch } = useGetMyLocationsQuery()
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Handle location select
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location)
  }

  // UI states
  const hasLocations = locations && locations.length > 0

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {t('dashboard.title')}
        </h1>
        <Link
          href="/locations/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {t('dashboard.addLocation')}
        </Link>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {t('error.fetchFailed')}
              </p>
              <button 
                onClick={() => refetch()}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
              >
                {t('common.retry')}
              </button>
            </div>
          </div>
        </div>
      ) : !hasLocations ? (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-16 sm:px-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No locations</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('dashboard.noLocations')}
            </p>
            <div className="mt-6">
              <Link
                href="/locations/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {t('dashboard.addLocation')}
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {locations.map((location) => (
                  <li key={location.id}>
                    <button
                      onClick={() => handleLocationSelect(location)}
                      className={`block hover:bg-gray-50 w-full text-left ${
                        selectedLocation?.id === location.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {location.name}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {location.accessibilityFeatures?.length || 0} {t('accessibility.features')}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 flex justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg
                                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {location.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {selectedLocation ? (
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedLocation.name}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {selectedLocation.address}
                  </p>
                </div>
                
                <div className="h-64">
                  <DashboardMap location={selectedLocation} />
                </div>
                
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="text-sm font-medium text-gray-500">{t('accessibility.features')}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedLocation.accessibilityFeatures && selectedLocation.accessibilityFeatures.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedLocation.accessibilityFeatures.map((feature, index) => (
                              <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {feature}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">{t('accessibility.noFeatures')}</span>
                        )}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('locations.coordinates')}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedLocation.coordinates.y.toFixed(6)}, {selectedLocation.coordinates.x.toFixed(6)}
                      </dd>
                    </div>
                    
                    <div>
                      <dt className="text-sm font-medium text-gray-500">{t('locations.created')}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {selectedLocation.createdAt ? new Date(selectedLocation.createdAt).toLocaleDateString() : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                <div className="border-t border-gray-200 px-4 py-4 sm:px-6 flex justify-end space-x-3">
                  <Link
                    href={`/locations/edit/${selectedLocation.id}`}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('common.edit')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center px-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m-4 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {t('dashboard.selectLocation')}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('dashboard.selectLocationHint')}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}