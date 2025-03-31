import { useState } from 'react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import Layout from '@/components/layout/Layout';
import LocationCard from '@/components/locations/LocationCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import LocationMap from '@/components/locations/LocationMap';

// Mock data for demonstration
const mockLocations = [
  {
    id: '1',
    name: 'Музей Історії України',
    address: 'вул. Володимирська, 2',
    city: 'Київ',
    overallRating: 4.5,
    reviewsCount: 32,
    featuredFeatures: ['Пандус', 'Доступний туалет', 'Ліфт'],
    latitude: 50.4578,
    longitude: 30.5200,
  },
  {
    id: '2',
    name: 'Національна бібліотека',
    address: 'вул. Грушевського, 1',
    city: 'Київ',
    overallRating: 3.8,
    reviewsCount: 15,
    featuredFeatures: ['Пандус', 'Шрифт Брайля'],
    latitude: 50.4488,
    longitude: 30.5233,
  },
  {
    id: '3',
    name: 'Парк Шевченка',
    address: 'бульвар Тараса Шевченка',
    city: 'Київ',
    overallRating: 4.2,
    reviewsCount: 47,
    featuredFeatures: ['Доступні шляхи', 'Доступні туалети', 'Паркування для людей з інвалідністю'],
    latitude: 50.4412,
    longitude: 30.5132,
  },
  {
    id: '4',
    name: 'Центр науки',
    address: 'проспект Перемоги, 40',
    city: 'Київ',
    overallRating: 4.7,
    reviewsCount: 29,
    featuredFeatures: ['Ліфт', 'Пандус', 'Допомога персоналу'],
    latitude: 50.4542,
    longitude: 30.4918,
  }
];

export default function HomePage() {
  const { t } = useTranslation('common');
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push({
      pathname: '/map',
      query: { search: searchQuery },
    });
  };
  
  return (
    <Layout>
      <section className="bg-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl mb-8">
              {t('home.hero.subtitle')}
            </p>
            <form onSubmit={handleSearch} className="max-w-xl mx-auto">
              <div className="flex items-center">
                <Input
                  type="text"
                  placeholder={t('home.hero.searchPlaceholder')}
                  className="rounded-r-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fullWidth
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="rounded-l-none"
                >
                  {t('home.hero.searchButton')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t('home.featuredLocations')}</h2>
            <p className="text-lg text-gray-600 mt-4">{t('home.featuredDescription')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mockLocations.map((location) => (
              <LocationCard key={location.id} location={location} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push('/map')}
            >
              {t('home.viewAllButton')}
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{t('home.map.title')}</h2>
            <p className="text-lg text-gray-600 mt-4">{t('home.map.description')}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <LocationMap locations={mockLocations} />
          </div>
          
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/map')}
            >
              {t('home.map.button')}
            </Button>
          </div>
        </div>
      </section>
      
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold">{t('home.about.title')}</h2>
                <p className="text-lg text-gray-600 mt-4">
                  {t('home.about.description')}
                </p>
                <div className="mt-8">
                  <Button
                    variant="primary"
                    onClick={() => router.push('/about')}
                  >
                    {t('home.about.button')}
                  </Button>
                </div>
              </div>
              <div className="bg-gray-200 h-80 rounded-lg flex items-center justify-center">
                <span className="text-gray-600">Зображення проекту</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'uk', ['common'])),
    },
  };
};
