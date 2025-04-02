'use client'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useCreateLocationMutation } from '@/services/api'

// Define validation schema
const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  address: z.string().min(1, 'Address is required'),
  coordinates: z.object({
    x: z.number(),
    y: z.number()
  }),
  accessibilityFeatures: z.array(z.string()).optional()
})

type LocationFormData = z.infer<typeof locationSchema>

// Import map component dynamically to avoid SSR issues
const LocationPickerMap = dynamic(() => import('@/components/map/LocationPickerMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  )
})

// Accessibility feature options
const accessibilityOptions = [
  { id: 'ramp', name: 'accessibility.ramp' },
  { id: 'elevator', name: 'accessibility.elevator' },
  { id: 'handrails', name: 'accessibility.handrails' },
  { id: 'wheelchair', name: 'accessibility.wheelchair' },
  { id: 'braille', name: 'accessibility.braille' },
  { id: 'parking', name: 'accessibility.parking' },
  { id: 'toilet', name: 'accessibility.toilet' }
]

export default function NewLocationPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isMapReady, setIsMapReady] = useState(false)
  const [createLocation, { isLoading, isSuccess, isError, error }] = useCreateLocationMutation()
  
  // Form setup
  const { 
    register, 
    handleSubmit, 
    control,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      coordinates: { x: 30.52, y: 50.45 }, // Default to Kyiv
      accessibilityFeatures: []
    }
  })

  // Handle map click to set coordinates
  const handleMapClick = (lat: number, lng: number) => {
    setValue('coordinates', { y: lat, x: lng }, { shouldValidate: true })
  }

  // Handle geocoding from address
  const handleGeocodeAddress = async () => {
    const address = document.getElementById('address') as HTMLInputElement
    if (!address.value) return

    try {
      // This would be replaced with a real geocoding service in production
      // For now, we'll set dummy coordinates near Kyiv
      const randomOffset = () => (Math.random() - 0.5) * 0.1
      setValue('coordinates', { 
        y: 50.45 + randomOffset(), 
        x: 30.52 + randomOffset() 
      }, { shouldValidate: true })
    } catch (error) {
      console.error('Geocoding failed:', error)
    }
  }

  // Handle form submission
  const onSubmit = async (data: LocationFormData) => {
    try {
      await createLocation(data).unwrap()
      // Form will be auto-reset on success
    } catch (error) {
      console.error('Failed to create location:', error)
    }
  }

  // Redirect on successful creation
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  }, [isSuccess, router])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {t('locations.new.title')}
          </h2>
        </div>
      </div>

 {/* Success message */}
 {isSuccess && (
        <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                {t('locations.new.success')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {isError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {t('error.locationCreateFailed')}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
        <div className="space-y-6">
          {/* Basic info */}
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('locations.basicInfo')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('locations.basicInfoDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t('locations.new.name')}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                />
              </div>
              {errors.name && (
                <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                {t('locations.new.address')}
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="address"
                  {...register('address')}
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleGeocodeAddress}
                  className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('locations.findOnMap')}
                </button>
              </div>
              {errors.address && (
                <p className="mt-2 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('locations.new.coordinates')}
              </label>
              <div className="flex space-x-4 mb-2">
                <div>
                  <label htmlFor="lat" className="block text-xs text-gray-500">
                    {t('locations.latitude')}
                  </label>
                  <Controller
                    name="coordinates.y"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="lat"
                        type="number"
                        step="0.000001"
                        {...field}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    )}
                  />
                </div>
                <div>
                  <label htmlFor="lng" className="block text-xs text-gray-500">
                    {t('locations.longitude')}
                  </label>
                  <Controller
                    name="coordinates.x"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="lng"
                        type="number"
                        step="0.000001"
                        {...field}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    )}
                  />
                </div>
              </div>

              <div className="h-64 bg-gray-100 rounded-lg overflow-hidden">
                <LocationPickerMap 
                  onMapClick={handleMapClick} 
                  onMapReady={() => setIsMapReady(true)}
                  defaultPosition={[50.45, 30.52]}
                  markerPosition={[
                    control._formValues.coordinates.y,
                    control._formValues.coordinates.x
                  ]}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t('locations.mapInstructions')}
              </p>
            </div>
          </div>

          {/* Accessibility features */}
          <div className="mt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {t('accessibility.features')}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('accessibility.featuresDescription')}
            </p>
            
            <fieldset className="mt-4">
              <legend className="sr-only">{t('accessibility.features')}</legend>
              <div className="space-y-4">
                {accessibilityOptions.map((option) => (
                  <div key={option.id} className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={option.id}
                        type="checkbox"
                        value={option.id}
                        {...register('accessibilityFeatures')}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={option.id} className="font-medium text-gray-700">
                        {t(option.name)}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        </div>

        {/* Form actions */}
        <div className="pt-5">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading || !isMapReady}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.saving')}
                </>
              ) : (
                t('locations.new.create')
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}