// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Ukrainian translations
const ua = {
  common: {
    retry: 'Спробувати знову',
    loading: 'Завантаження...',
    saving: 'Збереження...',
    save: 'Зберегти',
    cancel: 'Скасувати',
    add: 'Додати',
    delete: 'Видалити',
    edit: 'Редагувати',
    logout: 'Вийти',
  },
  map: {
    title: 'Карта доступності',
    locations: 'Локації',
    search: 'Пошук локацій',
    filters: 'Фільтри',
  },
  home: {
    welcome: 'Вітаємо в системі безбар\'єрного доступу України',
    redirecting: 'Переадресація на карту...',
    goToMap: 'Перейти до карти',
  },
  accessibility: {
    features: 'Особливості доступності',
    featuresDescription: 'Виберіть усі доступні особливості для цієї локації',
    noFeatures: 'Немає зазначених особливостей доступності',
    ramp: 'Пандус',
    elevator: 'Ліфт',
    handrails: 'Поручні',
    wheelchair: 'Доступ для візків',
    braille: 'Шрифт Брайля',
    parking: 'Паркування для інвалідів',
    toilet: 'Доступний туалет',
  },
  login: {
    title: 'Вхід до системи',
    email: 'Електронна пошта',
    password: 'Пароль',
    submit: 'Увійти',
    forgotPassword: 'Забули пароль?',
    register: 'Зареєструватися',
  },
  dashboard: {
    title: 'Панель керування',
    myLocations: 'Мої локації',
    addLocation: 'Додати локацію',
    noLocations: 'У вас ще немає доданих локацій. Створіть нову локацію, щоб вона відображалася тут.',
    selectLocation: 'Виберіть локацію зі списку',
    selectLocationHint: 'Для перегляду детальної інформації виберіть локацію зі списку зліва',
  },
  locations: {
    new: {
      title: 'Нова локація',
      name: 'Назва',
      address: 'Адреса',
      coordinates: 'Координати',
      features: 'Особливості доступності',
      nameRequired: 'Назва обов\'язкова',
      create: 'Створити',
      success: 'Локація створена!',
    },
    basicInfo: 'Основна інформація',
    basicInfoDescription: 'Вкажіть основну інформацію про доступний об\'єкт',
    coordinates: 'Координати',
    latitude: 'Широта',
    longitude: 'Довгота',
    findOnMap: 'Знайти на карті',
    mapInstructions: 'Клацніть на карті, щоб вибрати місце розташування, або введіть координати вручну',
    created: 'Дата створення',
  },
  error: {
    fetchFailed: 'Помилка завантаження даних',
    mapLoadFailed: 'Не вдалося завантажити карту',
    loginFailed: 'Помилка входу в систему',
    locationCreateFailed: 'Помилка створення локації',
  },
};

// English translations
const en = {
  common: {
    retry: 'Retry',
    loading: 'Loading...',
    saving: 'Saving...',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    delete: 'Delete',
    edit: 'Edit',
    logout: 'Logout',
  },
  map: {
    title: 'Accessibility Map',
    locations: 'Locations',
    search: 'Search locations',
    filters: 'Filters',
  },
  home: {
    welcome: 'Welcome to the Accessibility Map of Ukraine',
    redirecting: 'Redirecting to map...',
    goToMap: 'Go to Map',
  },
  accessibility: {
    features: 'Accessibility Features',
    featuresDescription: 'Select all accessibility features available at this location',
    noFeatures: 'No accessibility features specified',
    ramp: 'Ramp',
    elevator: 'Elevator',
    handrails: 'Handrails',
    wheelchair: 'Wheelchair Access',
    braille: 'Braille',
    parking: 'Disabled Parking',
    toilet: 'Accessible Toilet',
  },
  login: {
    title: 'Login',
    email: 'Email',
    password: 'Password',
    submit: 'Login',
    forgotPassword: 'Forgot Password?',
    register: 'Register',
  },
  dashboard: {
    title: 'Dashboard',
    myLocations: 'My Locations',
    addLocation: 'Add Location',
    noLocations: 'You don\'t have any locations yet. Create a new location to see it here.',
    selectLocation: 'Select a location from the list',
    selectLocationHint: 'To view detailed information, select a location from the list on the left',
  },
  locations: {
    new: {
      title: 'New Location',
      name: 'Name',
      address: 'Address',
      coordinates: 'Coordinates',
      features: 'Accessibility Features',
      nameRequired: 'Name is required',
      create: 'Create',
      success: 'Location created!',
    },
    basicInfo: 'Basic Information',
    basicInfoDescription: 'Provide basic information about the accessible location',
    coordinates: 'Coordinates',
    latitude: 'Latitude',
    longitude: 'Longitude',
    findOnMap: 'Find on Map',
    mapInstructions: 'Click on the map to select a location, or enter coordinates manually',
    created: 'Creation Date',
  },
  error: {
    fetchFailed: 'Failed to fetch data',
    mapLoadFailed: 'Failed to load map',
    loginFailed: 'Login failed',
    locationCreateFailed: 'Failed to create location',
  },
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      uk: { translation: ua },
      en: { translation: en },
    },
    lng: 'uk', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;