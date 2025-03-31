import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Layout from '@/components/layout/Layout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { locationsApi } from '@/lib/api';

// Динамічно імпортуємо карту, оскільки вона використовує DOM API, які доступні тільки на клієнті
const LocationMap = dynamic(() => import('@/components/locations/LocationMap'), {
  ssr: false,
  loading: () => <div className="h-screen bg-gray-100 rounded-lg animate-pulse" />
});

// Приклад інтерфейсу для даних з API
interface LocationFeature {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  overallRating: number;
  reviewsCount: number;
  features: LocationFeature[];
  mainPhotoId?: string;
}

// Демо-дані для карти
const mockLocations = [
  {
    id: '1',
    name: 'Музей Історії України',
    address: 'вул. Володимирська, 2',
    city: 'Київ',
    latitude: 50.4578,
    longitude: 30.5200,
    overallRating: 4.5,
    reviewsCount: 32,
    features: [
      { id: '1', name: 'Пандус' },
      { id: '2', name: 'Доступний туалет' },
      { id: '3', name: 'Ліфт' }
    ]
  },
  {
    id: '2',
    name: 'Національна бібліотека',
    address: 'вул. Грушевського, 1',
    city: 'Київ',
    latitude: 50.4488,
    longitude: 30.5233,
    overallRating: 3.8,
    reviewsCount: 15,
    features: [
      { id: '1', name: 'Пандус' },
      { id: '4', name: 'Шрифт Брайля' }
    ]
  },
  {
    id: '3',
    name: 'Парк Шевченка',
    address: 'бульвар Тараса Шевченка',
    city: 'Київ',
    latitude: 50.4412,
    longitude: 30.5132,
    overallRating: 4.2,
    reviewsCount: 47,
    features: [
      { id: '5', name: 'Доступні шляхи' },
      { id: '2', name: 'Доступні туалети' },
      { id: '6', name: 'Паркування для людей з інвалідністю' }
    ]
  },
  // Додайте більше локацій для різних міст
  {
    id: '4',
    name: 'Львівська Опера',
    address: 'Проспект Свободи, 28',
    city: 'Львів',
    latitude: 49.8438,
    longitude: 24.0260,
    overallRating: 4.8,
    reviewsCount: 74,
    features: [
      { id: '1', name: 'Пандус' },
      { id: '2', name: 'Доступний туалет' },
      { id: '3', name: 'Ліфт' },
      { id: '7', name: 'Аудіо-гід' }
    ]
  },
  {
    id: '5',
    name: 'Одеський Оперний Театр',
    address: 'вул. Чайковського, 1',
    city: 'Одеса',
    latitude: 46.4846,
    longitude: 30.7415,
    overallRating: 4.6,
    reviewsCount: 58,
    features: [
      { id: '1', name: 'Пандус' },
      { id: '3', name: 'Ліфт' },
      { id: '8', name: 'Допомога персоналу' }
    ]
  },
  {
    id: '6',
    name: 'Чернігівський Вал',
    address: 'вул. Преображенська, 1',
    city: 'Чернігів',
    latitude: 51.4982,
    longitude: 31.2893,
    overallRating: 4.3,
    reviewsCount: 42,
    features: [
      { id: '1', name: 'Пандус' },
      { id: '5', name: 'Доступні шляхи' },
      { id: '8', name: 'Допомога персоналу' }
    ]
  },
  {
    id: '7',
    name: 'Чернігівський Драматичний театр',
    address: 'вул. Театральна, 6',
    city: 'Чернігів',
    latitude: 51.4930,
    longitude: 31.2952,
    overallRating: 4.5,
    reviewsCount: 36,
    features: [
      { id: '1', name: 'Пандус' },
      { id: '2', name: 'Доступний туалет' },
      { id: '8', name: 'Допомога персоналу' }
    ]
  }
];

// Приклад доступних функцій фільтрації
const availableFeatures = [
  { id: '1', name: 'Пандус' },
  { id: '2', name: 'Доступний туалет' },
  { id: '3', name: 'Ліфт' },
  { id: '4', name: 'Шрифт Брайля' },
  { id: '5', name: 'Доступні шляхи' },
  { id: '6', name: 'Паркування для людей з інвалідністю' },
  { id: '7', name: 'Аудіо-гід' },
  { id: '8', name: 'Допомога персоналу' },
  { id: '9', name: 'Тактильна плитка' },
  { id: '10', name: 'Звукові сигнали' }
];

export default function MapPage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [search, setSearch] = useState<string>(router.query.search as string || '');
  const [filteredLocations, setFilteredLocations] = useState<Location[]>(mockLocations);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([50.4501, 30.5234]); // Початкові координати (Київ)
  const [mapZoom, setMapZoom] = useState<number>(10);
  
  // Ефект для ініціалізації клієнтського коду
  useEffect(() => {
    setIsClient(true);
    
    // Перевіряємо, чи є параметр пошуку в URL
    if (router.query.search) {
      setSearch(router.query.search as string);
      // Тут мав би бути API запит з пошуковим параметром
      // filterLocations(router.query.search as string);
    }
    
    // Тут мав би бути запит для отримання всіх локацій
    // fetchLocations();
  }, [router.query.search]);
  
  // В реальному додатку тут був би API запит
  const fetchLocations = async () => {
    try {
      // const response = await locationsApi.getAll();
      // setFilteredLocations(response.data);
      setFilteredLocations(mockLocations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };
  
  // Функція пошуку і фільтрації
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // В реальному додатку тут був би API запит з фільтрами
    // Наразі просто фільтруємо моковані дані
    const filtered = mockLocations.filter(location => {
      // Пошук за назвою, адресою або містом
      const matchesSearch = search.trim() === '' || 
        location.name.toLowerCase().includes(search.toLowerCase()) ||
        location.address.toLowerCase().includes(search.toLowerCase()) ||
        location.city.toLowerCase().includes(search.toLowerCase());
      
      // Фільтрація за функціями доступності
      const matchesFeatures = selectedFeatures.length === 0 || 
        selectedFeatures.every(featureId => 
          location.features.some(f => f.id === featureId)
        );
      
      return matchesSearch && matchesFeatures;
    });
    
    setFilteredLocations(filtered);
    
    // Оновлюємо URL з пошуковим запитом
    router.push({
      pathname: '/map',
      query: { search },
    }, undefined, { shallow: true });
  };
  
  const toggleFeature = (featureId: string) => {
    setSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };
  
  const clearFilters = () => {
    setSelectedFeatures([]);
    setSearch('');
    setFilteredLocations(mockLocations);
    
    router.push({
      pathname: '/map',
    }, undefined, { shallow: true });
  };
  
  // Функція для встановлення центру карти при виборі міста
  const setLocationByCity = (city: string) => {
    const cityCoordinates: Record<string, [number, number]> = {
      'Київ': [50.4501, 30.5234],
      'Львів': [49.8397, 24.0297],
      'Одеса': [46.4825, 30.7233],
      'Харків': [49.9935, 36.2304],
      'Дніпро': [48.4647, 35.0462],
      'Чернігів': [51.4982, 31.2893]
    };
    
    if (cityCoordinates[city]) {
      setMapCenter(cityCoordinates[city]);
      setMapZoom(12); // Збільшуємо зум при виборі міста
    }
  };
  
  return (
    <Layout title={t('map.pageTitle')}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white p-5 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">{t('locations.search')}</h2>
              
              <form onSubmit={handleSearch} className="mb-6">
                <div className="mb-4">
                  <Input
                    placeholder={t('locations.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={(
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                    fullWidth
                  />
                </div>
                
                <Button type="submit" variant="primary" fullWidth>
                  {t('buttons.search')}
                </Button>
              </form>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('map.cities')}</h3>
                <div className="flex flex-wrap gap-2">
                  {['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро', 'Чернігів'].map(city => (
                    <Button
                      key={city}
                      variant={mapCenter[0] === (
                        city === 'Київ' ? 50.4501 : 
                        city === 'Львів' ? 49.8397 : 
                        city === 'Одеса' ? 46.4825 : 
                        city === 'Харків' ? 49.9935 : 
                        city === 'Дніпро' ? 48.4647 : 
                        51.4982 // Чернігів
                      ) ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setLocationByCity(city)}
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-3">{t('locations.features')}</h3>
                <div className="space-y-2">
                  {availableFeatures.map(feature => (
                    <div key={feature.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`feature-${feature.id}`}
                        checked={selectedFeatures.includes(feature.id)}
                        onChange={() => toggleFeature(feature.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`feature-${feature.id}`} className="ml-2 block text-sm text-gray-700">
                        {feature.name}
                      </label>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    fullWidth
                  >
                    {t('buttons.clear')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-white p-5 rounded-lg shadow-md mb-5">
              <h1 className="text-2xl font-bold mb-2">{t('map.title')}</h1>
              <p className="text-gray-600 mb-4">{t('map.description')}</p>
              
              <div className="text-sm text-gray-500 mb-2">
                {filteredLocations.length === 0 ? (
                  <p>{t('locations.noResults')}</p>
                ) : (
                  <p>{t('map.foundLocations', { count: filteredLocations.length })}</p>
                )}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '70vh' }}>
              {isClient && (
                <LocationMap
                  locations={filteredLocations}
                  center={mapCenter}
                  zoom={mapZoom}
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'uk', ['common'])),
    },
  };
};
