-- Ініціалізація бази даних для системи "Безбар'єрний доступ України"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Створення необхідних типів для перерахувань
CREATE TYPE file_status AS ENUM ('ACTIVE', 'DELETED', 'PENDING', 'REJECTED');
CREATE TYPE notification_type AS ENUM ('SYSTEM', 'NEW_LOCATION', 'LOCATION_MODERATION', 'REVIEW', 'REPORT_STATUS', 'ACCESS_FEATURES', 'EVENT', 'MESSAGE');
CREATE TYPE notification_channel AS ENUM ('EMAIL', 'PUSH', 'SMS', 'IN_APP');
CREATE TYPE delivery_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'DELIVERED', 'READ');

-- Ролі користувачів
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Організації
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('government', 'business', 'ngo')),
    edrpou VARCHAR(15) UNIQUE,
    website VARCHAR(255),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_document_url VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Користувачі
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role_id UUID NOT NULL REFERENCES roles(id),
    gov_id VARCHAR(255) UNIQUE,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
    avatar_url VARCHAR(255),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Токени оновлення
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Локації/об'єкти
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    coordinates GEOMETRY(POINT, 4326) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('government_building', 'business', 'healthcare', 'education', 'culture', 'transport', 'recreation', 'other')),
    category VARCHAR(100),
    description TEXT,
    contacts JSONB,
    working_hours JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
    overall_accessibility_score INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_verified_at TIMESTAMP,
    rejection_reason TEXT
);

-- Індекс для пошуку локацій за координатами
CREATE INDEX idx_locations_coordinates ON locations USING GIST(coordinates);

-- Елементи безбар'єрності
CREATE TABLE IF NOT EXISTS accessibility_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ramp', 'elevator', 'call_button', 'tactile_path', 'accessible_toilet', 'parking', 'entrance', 'interior', 'signage', 'other')),
    subtype VARCHAR(100),
    description TEXT,
    status BOOLEAN NOT NULL,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    standards_compliance BOOLEAN,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Фотографії
CREATE TABLE IF NOT EXISTS photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES accessibility_features(id),
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    ai_moderation_score FLOAT,
    ai_accessibility_detection JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reject_reason TEXT,
    metadata JSONB
);

-- Верифікації
CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    feature_id UUID REFERENCES accessibility_features(id),
    verified_by UUID NOT NULL REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    status BOOLEAN NOT NULL,
    comment TEXT,
    evidence_photo_id UUID REFERENCES photos(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    is_official BOOLEAN NOT NULL DEFAULT FALSE
);

-- Відгуки
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    accessibility_experience TEXT,
    moderation_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Система сповіщень
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL,
    channel notification_channel NOT NULL,
    status delivery_status NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    email_address TEXT,
    phone_number TEXT,
    device_tokens TEXT[],
    categories notification_type[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    type notification_type NOT NULL,
    subject TEXT,
    html_body TEXT,
    text_body TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Аудит-логи
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Файли
CREATE TABLE IF NOT EXISTS files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT NOT NULL,
    filename TEXT NOT NULL UNIQUE,
    path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    location_id UUID,
    user_id UUID NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    status file_status NOT NULL DEFAULT 'ACTIVE',
    thumbnail_path TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Таблиці для аналітики
CREATE TABLE IF NOT EXISTS "AnalyticsEvent" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventType" VARCHAR(50) NOT NULL,
  "userId" UUID,
  "userRole" VARCHAR(50),
  "deviceType" VARCHAR(50),
  "ipAddress" VARCHAR(50),
  "userAgent" TEXT,
  "referrer" TEXT,
  "timestamp" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "data" JSONB
);

CREATE TABLE IF NOT EXISTS "AnalyticsReport" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "type" VARCHAR(50) NOT NULL,
  "query" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "lastRunAt" TIMESTAMP WITH TIME ZONE,
  "schedule" VARCHAR(50),
  "isActive" BOOLEAN DEFAULT TRUE,
  "creatorId" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS "Dashboard" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "layout" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "isPublic" BOOLEAN DEFAULT FALSE,
  "creatorId" UUID NOT NULL
);

CREATE TABLE IF NOT EXISTS "LocationAnalytics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "locationId" UUID NOT NULL UNIQUE,
  "viewCount" INTEGER DEFAULT 0,
  "searchCount" INTEGER DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "avgRating" FLOAT,
  "lastViewed" TIMESTAMP WITH TIME ZONE,
  "popularityScore" FLOAT DEFAULT 0,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "UserAnalytics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL UNIQUE,
  "sessionCount" INTEGER DEFAULT 0,
  "totalTimeSpent" INTEGER DEFAULT 0,
  "lastActivity" TIMESTAMP WITH TIME ZONE,
  "locationsAdded" INTEGER DEFAULT 0,
  "reviewsSubmitted" INTEGER DEFAULT 0,
  "searchesPerformed" INTEGER DEFAULT 0,
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "GeoAnalytics" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "regionName" VARCHAR(255) NOT NULL,
  "cityName" VARCHAR(255),
  "locationCount" INTEGER DEFAULT 0,
  "accessibleCount" INTEGER DEFAULT 0,
  "inaccessibleCount" INTEGER DEFAULT 0,
  "partiallyAccessibleCount" INTEGER DEFAULT 0,
  "popularCategory" VARCHAR(255),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("regionName", "cityName")
);

-- Створення додаткових індексів
CREATE INDEX idx_files_location_id ON files(location_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_status ON files(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notification_channels_status ON notification_channels(status);

CREATE INDEX "idx_analytics_event_eventType" ON "AnalyticsEvent"("eventType");
CREATE INDEX "idx_analytics_event_userId" ON "AnalyticsEvent"("userId");
CREATE INDEX "idx_analytics_event_timestamp" ON "AnalyticsEvent"("timestamp");

CREATE INDEX "idx_analytics_report_type" ON "AnalyticsReport"("type");
CREATE INDEX "idx_analytics_report_creatorId" ON "AnalyticsReport"("creatorId");

CREATE INDEX "idx_dashboard_creatorId" ON "Dashboard"("creatorId");

CREATE INDEX "idx_location_analytics_locationId" ON "LocationAnalytics"("locationId");
CREATE INDEX "idx_location_analytics_popularityScore" ON "LocationAnalytics"("popularityScore");

CREATE INDEX "idx_user_analytics_userId" ON "UserAnalytics"("userId");

CREATE INDEX "idx_geo_analytics_regionName" ON "GeoAnalytics"("regionName");
CREATE INDEX "idx_geo_analytics_cityName" ON "GeoAnalytics"("cityName");

-- Додамо базові ролі
INSERT INTO roles (name, description, permissions) VALUES
('user', 'Звичайний користувач', '{"locations": {"create": true, "read": true, "update": true, "delete": false}, "features": {"create": true, "read": true, "update": true, "delete": false}, "reviews": {"create": true, "read": true, "update": true, "delete": false}}'),
('business', 'Представник бізнесу', '{"locations": {"create": true, "read": true, "update": true, "delete": true}, "features": {"create": true, "read": true, "update": true, "delete": true}, "reviews": {"create": false, "read": true, "update": false, "delete": false}}'),
('government', 'Представник державних органів', '{"locations": {"create": true, "read": true, "update": true, "delete": true}, "features": {"create": true, "read": true, "update": true, "delete": true}, "verifications": {"create": true, "read": true}}'),
('moderator', 'Модератор', '{"locations": {"create": true, "read": true, "update": true, "delete": true, "moderation": true}, "features": {"create": true, "read": true, "update": true, "delete": true}, "reviews": {"create": true, "read": true, "update": true, "delete": true, "moderation": true}}'),
('admin', 'Адміністратор', '{"all": {"create": true, "read": true, "update": true, "delete": true, "moderation": true}}');

-- Додамо тестового адміністратора (пароль: Admin123!)
INSERT INTO users (email, full_name, role_id, verification_status, password_hash) VALUES
('admin@example.com', 'Адміністратор Системи', (SELECT id FROM roles WHERE name = 'admin'), 'verified', '$2a$10$JKm/UZC4KLwO/Z1C7Nssg.4NzwrKlw7dKv7/Z9h5oVrxjLbfAw0uu');