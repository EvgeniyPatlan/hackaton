#!/bin/bash

echo "🧹 Видаляю старі файли..."
rm -f src/app/map/page.tsx
rm -f src/components/map/MapView.tsx
rm -f src/app/login/page.tsx
rm -f src/app/dashboard/page.tsx
rm -f src/app/locations/new/page.tsx
rm -f src/services/api.ts
rm -f src/store/index.ts
rm -f src/store/slices/authSlice.ts

echo "📁 Створюю нові директорії..."
mkdir -p src/lib
mkdir -p src/components/ui
mkdir -p src/components/map
mkdir -p src/app/locations/new
mkdir -p src/store/slices

echo "🆕 Створюю пусті файли для нових компонентів..."
touch src/lib/i18n.ts
touch src/components/ProviderWrapper.tsx
touch src/components/map/DashboardMap.tsx
touch src/components/map/LocationPickerMap.tsx
touch src/components/ui/Header.tsx
touch src/app/page.tsx

echo "✅ Готово! Тепер ти можеш скопіювати новий код у ці файли."
