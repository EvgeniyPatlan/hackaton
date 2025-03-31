-- Ініціалізація бази даних для системи "Безбар'єрний доступ України"

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

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

-- Сповіщення
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
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
