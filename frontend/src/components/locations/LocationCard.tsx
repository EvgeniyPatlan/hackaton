import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { filesApi } from '@/lib/api';

interface LocationCardProps {
  location: {
    id: string;
    name: string;
    address: string;
    city: string;
    overallRating: number;
    reviewsCount: number;
    mainPhotoId?: string;
    featuredFeatures?: string[];
  };
}

export default function LocationCard({ location }: LocationCardProps) {
  const { t } = useTranslation('common');
  
  // Генеруємо URL для зображення
  const imageUrl = location.mainPhotoId 
    ? filesApi.getFile(location.mainPhotoId) 
    : '/images/placeholder-location.jpg';
  
  // Підготовка списку доступностей для відображення
  const featuresList = location.featuredFeatures?.slice(0, 3) || [];
  
  // Функція для відображення зірочок рейтингу
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) 
                ? 'text-yellow-400' 
                : i < rating 
                  ? 'text-yellow-300' 
                  : 'text-gray-300'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-1 text-sm text-gray-600">({location.reviewsCount})</span>
      </div>
    );
  };

  return (
    <Link href={`/locations/${location.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={location.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{location.name}</h3>
          <p className="text-sm text-gray-600 truncate">{location.address}, {location.city}</p>
          <div className="mt-2">
            {renderStars(location.overallRating)}
          </div>
          
          {featuresList.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 uppercase">{t('locations.accessibility')}</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {featuresList.map((feature) => (
                  <span key={feature} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {feature}
                  </span>
                ))}
                {location.featuredFeatures && location.featuredFeatures.length > 3 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    +{location.featuredFeatures.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
