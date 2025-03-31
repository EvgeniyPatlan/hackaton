-- Скрипт для наповнення бази тестовими даними

-- 1. Додаємо організації
INSERT INTO organizations (id, name, type, edrpou, website, is_verified) VALUES
('2a4e62b8-cb61-4b05-90b3-8b6864ecf0aa', 'Міністерство цифрової трансформації України', 'government', '43220851', 'https://thedigital.gov.ua', true),
('3f15b7a9-5a42-48cb-98d0-7d92ccd74f17', 'Київська міська державна адміністрація', 'government', '00022527', 'https://kyivcity.gov.ua', true),
('6bb85e4c-4c4e-4fb6-a899-e1f9bf8f0eb4', 'ТОВ "Епіцентр К"', 'business', '32490244', 'https://epicentrk.ua', true),
('7dc32a8a-8e9f-4b9e-a246-9df35e387d15', 'McDonald''s Україна', 'business', '23744453', 'https://mcdonalds.ua', true),
('91e17dcb-b239-469e-acdc-4ade1066391c', 'ВГО "Безбар''єрність"', 'ngo', '12345678', 'https://bezbariernist.org.ua', true);

-- 2. Додаємо тестових користувачів (пароль для всіх: Test123!)
INSERT INTO users (id, email, full_name, phone, role_id, verification_status, avatar_url, organization_id, is_active, password_hash) VALUES
-- Користувачі із роллю "user"
('f1b45b7a-e68f-4e42-9eb5-39a3825ea97c', 'user1@example.com', 'Іван Петренко', '+380991234501', (SELECT id FROM roles WHERE name = 'user'), 'verified', NULL, NULL, true, '$2a$10$cgGh8FK5QCArCRZdY0KZ6.5bscaMnlrx2R3z3NfM52qfdjx3sLnL6'),
('a8912c5e-7f2b-4d8a-b1d6-8c4eea9d2790', 'user2@example.com', 'Марія Коваленко', '+380991234502', (SELECT id FROM roles WHERE name = 'user'), 'verified', NULL, NULL, true, '$2a$10$cgGh8FK5QCArCRZdY0KZ6.5bscaMnlrx2R3z3NfM52qfdjx3sLnL6'),

-- Представники бізнесу
('d5e7bf9c-8c8f-4b4a-a2d0-6e23d0e4a94b', 'business1@example.com', 'Олександр Сидоренко', '+380991234503', (SELECT id FROM roles WHERE name = 'business'), 'verified', NULL, '6bb85e4c-4c4e-4fb6-a899-e1f9bf8f0eb4', true, '$2a$10$cgGh8FK5QCArCRZdY0KZ6.5bscaMnlrx2R3z3NfM52qfdjx3sLnL6'),
('7a6bb89e-31d5-4c3a-bda3-7c9f3b9315ce', 'business2@example.com', 'Наталія Мельник', '+380991234504', (SELECT id FROM roles WHERE name = 'business'), 'verified', NULL, '7dc32a8a-8e9f-4b9e-a246-9df35e387d15', true, '$2a$10$cgGh8FK5QCArCRZdY0KZ6.5bscaMnlrx2R3z3NfM52qfdjx3sLnL6'),

-- Представники держорганів
('29cb485e-8d4a-4c5b-a7d8-b9f3c1d9e7f6', 'gov1@example.com', 'Василь Петрович', '+380991234505', (SELECT id FROM roles WHERE name = 'government'), 'verified', NULL, '2a4e62b8-cb61-4b05-90b3-8b6864ecf0aa', true, '$2a$10$cgGh8FK5QCArCRZdY0KZ6.5bscaMnlrx2R3z3NfM52qfdjx3sLnL6'),
('1f9e2d8c-7b6a-5c4d-3e2f-1a0b9c8d7e6f', 'gov2@example.com', 'Ольга Іванівна', '+380991234506', (SELECT id FROM roles WHERE name = 'government'), 'verified', NULL, '3f15b7a9-5a42-48cb-98d0-7d92ccd74f17', true, '$2a$10$cgGh8FK5QCArCRZdY0KZ6.5bscaMnlrx2R3z3NfM52qfdjx3sLnL6'),

-- Модератори
('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'moderator@example.com', 'Михайло Модератор', '+380991234507', (SELECT id FROM roles WHERE name = 'moderator'), 'verified', NULL, '91e17dcb-b239-469e-acdc-4ade1066391c', true, '$2a$10$cgGh8FK5QCArCRZdY0KZ6.5bscaMnlrx2R3z3NfM52qfdjx3sLnL6');

-- 3. Додаємо тестові локації
INSERT INTO locations (id, name, address, coordinates, type, category, description, contacts, working_hours, created_by, organization_id, status, overall_accessibility_score, created_at) VALUES
-- Державні будівлі
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'ЦНАП Шевченківського району', 'м. Київ, бульвар Тараса Шевченка, 26/4', ST_SetSRID(ST_MakePoint(30.503324, 50.446999), 4326), 'government_building', 'cnap', 'Центр надання адміністративних послуг Шевченківського району', '{"phone": "+380442784464", "email": "cnap@shev.kyivcity.gov.ua", "website": "https://kyivcnap.gov.ua"}', '{"weekdays": "9:00-18:00", "saturday": "9:00-16:00", "sunday": "closed"}', '1f9e2d8c-7b6a-5c4d-3e2f-1a0b9c8d7e6f', '3f15b7a9-5a42-48cb-98d0-7d92ccd74f17', 'published', 78, NOW() - INTERVAL '3 months'),

('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Міністерство цифрової трансформації', 'м. Київ, вул. Ділова, 24', ST_SetSRID(ST_MakePoint(30.521541, 50.437276), 4326), 'government_building', 'ministry', 'Міністерство цифрової трансформації України', '{"phone": "+380442556700", "email": "hello@thedigital.gov.ua", "website": "https://thedigital.gov.ua"}', '{"weekdays": "9:00-18:00", "saturday": "closed", "sunday": "closed"}', '29cb485e-8d4a-4c5b-a7d8-b9f3c1d9e7f6', '2a4e62b8-cb61-4b05-90b3-8b6864ecf0aa', 'published', 92, NOW() - INTERVAL '2 months'),

-- Комерційні об'єкти
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Епіцентр Київ Полярна', 'м. Київ, вул. Полярна, 20Д', ST_SetSRID(ST_MakePoint(30.427391, 50.518780), 4326), 'business', 'shopping', 'Гіпермаркет будівельних матеріалів', '{"phone": "+380800500500", "website": "https://epicentrk.ua"}', '{"weekdays": "7:30-22:30", "saturday": "7:30-22:30", "sunday": "7:30-22:30"}', 'd5e7bf9c-8c8f-4b4a-a2d0-6e23d0e4a94b', '6bb85e4c-4c4e-4fb6-a899-e1f9bf8f0eb4', 'published', 85, NOW() - INTERVAL '5 months'),

('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'McDonald''s Хрещатик', 'м. Київ, вул. Хрещатик, 19', ST_SetSRID(ST_MakePoint(30.522664, 50.447516), 4326), 'business', 'restaurant', 'Ресторан швидкого харчування McDonald''s', '{"phone": "+380445909090", "website": "https://mcdonalds.ua"}', '{"weekdays": "8:00-23:00", "saturday": "8:00-23:00", "sunday": "8:00-23:00"}', '7a6bb89e-31d5-4c3a-bda3-7c9f3b9315ce', '7dc32a8a-8e9f-4b9e-a246-9df35e387d15', 'published', 90, NOW() - INTERVAL '1 month'),

-- Медичні заклади
('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Київська міська клінічна лікарня №1', 'м. Київ, вул. Харківське шосе, 121', ST_SetSRID(ST_MakePoint(30.654215, 50.428314), 4326), 'healthcare', 'hospital', 'Міська клінічна лікарня', '{"phone": "+380444891309", "email": "hospital1@health.kiev.ua"}', '{"weekdays": "8:00-20:00", "saturday": "9:00-15:00", "sunday": "closed"}', 'f1b45b7a-e68f-4e42-9eb5-39a3825ea97c', NULL, 'published', 65, NOW() - INTERVAL '6 months'),

-- Освітні заклади
('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'Київський національний університет ім. Т.Шевченка', 'м. Київ, вул. Володимирська, 60', ST_SetSRID(ST_MakePoint(30.513262, 50.441826), 4326), 'education', 'university', 'Головний корпус КНУ ім. Т.Шевченка', '{"phone": "+380442393333", "email": "office.chief@knu.ua", "website": "https://www.knu.ua"}', '{"weekdays": "8:00-20:00", "saturday": "8:00-18:00", "sunday": "closed"}', 'a8912c5e-7f2b-4d8a-b1d6-8c4eea9d2790', NULL, 'published', 70, NOW() - INTERVAL '4 months'),

-- Культурні об'єкти
('a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d', 'Національний художній музей України', 'м. Київ, вул. М. Грушевського, 6', ST_SetSRID(ST_MakePoint(30.528547, 50.447853), 4326), 'culture', 'museum', 'Національний художній музей України', '{"phone": "+380442781357", "email": "info@namu.kiev.ua", "website": "http://namu.kiev.ua"}', '{"weekdays": "10:00-18:00", "thursday": "13:00-21:00", "monday": "closed", "saturday": "10:00-18:00", "sunday": "10:00-18:00"}', '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', NULL, 'published', 82, NOW() - INTERVAL '2 months'),

-- Транспортна інфраструктура
('b8c9d0e1-f2a3-4b5c-6d7e-8f9a0b1c2d3e', 'Станція метро Вокзальна', 'м. Київ, вул. Симона Петлюри, 2/4', ST_SetSRID(ST_MakePoint(30.490533, 50.441271), 4326), 'transport', 'metro', 'Станція метро Святошинсько-Броварської лінії', '{"website": "https://www.metro.kyiv.ua"}', '{"weekdays": "5:30-0:00", "saturday": "5:30-0:00", "sunday": "6:00-0:00"}', '1f9e2d8c-7b6a-5c4d-3e2f-1a0b9c8d7e6f', '3f15b7a9-5a42-48cb-98d0-7d92ccd74f17', 'published', 75, NOW() - INTERVAL '7 months'),

-- Рекреаційні зони
('c9d0e1f2-a3b4-5c6d-7e8f-9a0b1c2d3e4f', 'Парк ім. Т. Шевченка', 'м. Київ, бул. Т. Шевченка, 14', ST_SetSRID(ST_MakePoint(30.500706, 50.441882), 4326), 'recreation', 'park', 'Міський парк у центрі Києва', '{"website": "https://kyivparks.gov.ua"}', '{"weekdays": "24/7", "saturday": "24/7", "sunday": "24/7"}', '29cb485e-8d4a-4c5b-a7d8-b9f3c1d9e7f6', '3f15b7a9-5a42-48cb-98d0-7d92ccd74f17', 'published', 88, NOW() - INTERVAL '8 months');

-- 4. Додаємо елементи безбар'єрності для локацій
INSERT INTO accessibility_features (id, location_id, type, subtype, description, status, quality_rating, standards_compliance, created_by, created_at) VALUES
-- ЦНАП Шевченківського району
('1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'ramp', 'permanent', 'Пандус при вході до будівлі', true, 4, true, '1f9e2d8c-7b6a-5c4d-3e2f-1a0b9c8d7e6f', NOW() - INTERVAL '3 months'),
('2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'elevator', 'passenger', 'Ліфт для доступу на верхні поверхи', true, 5, true, '1f9e2d8c-7b6a-5c4d-3e2f-1a0b9c8d7e6f', NOW() - INTERVAL '3 months'),
('3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'accessible_toilet', 'standard', 'Доступний туалет на першому поверсі', true, 4, true, '1f9e2d8c-7b6a-5c4d-3e2f-1a0b9c8d7e6f', NOW() - INTERVAL '3 months'),

-- Міністерство цифрової трансформації
('4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'ramp', 'permanent', 'Пандус при вході до будівлі', true, 5, true, '29cb485e-8d4a-4c5b-a7d8-b9f3c1d9e7f6', NOW() - INTERVAL '2 months'),
('5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'elevator', 'passenger', 'Ліфт для доступу на верхні поверхи', true, 5, true, '29cb485e-8d4a-4c5b-a7d8-b9f3c1d9e7f6', NOW() - INTERVAL '2 months'),
('6f7a8b9c-0d1e-2f3a-4b5c-6d7e8f9a0b1c', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'accessible_toilet', 'standard', 'Доступний туалет на кожному поверсі', true, 5, true, '29cb485e-8d4a-4c5b-a7d8-b9f3c1d9e7f6', NOW() - INTERVAL '2 months'),
('7a8b9c0d-1e2f-3a4b-5c6d-6e7f8a9b0c1d', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'call_button', 'entrance', 'Кнопка виклику персоналу при вході', true, 4, true, '29cb485e-8d4a-4c5b-a7d8-b9f3c1d9e7f6', NOW() - INTERVAL '2 months'),

-- Епіцентр Київ Полярна
('8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'ramp', 'permanent', 'Пандус при вході до гіпермаркету', true, 5, true, 'd5e7bf9c-8c8f-4b4a-a2d0-6e23d0e4a94b', NOW() - INTERVAL '5 months'),
('9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'elevator', 'cargo', 'Ліфти для доступу на другий поверх', true, 5, true, 'd5e7bf9c-8c8f-4b4a-a2d0-6e23d0e4a94b', NOW() - INTERVAL '5 months'),
('0d1e2f3a-4b5c-6d7e-8f9a-0b1c2d3e4f5a', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'accessible_toilet', 'standard', 'Доступний туалет на першому поверсі', true, 4, true, 'd5e7bf9c-8c8f-4b4a-a2d0-6e23d0e4a94b', NOW() - INTERVAL '5 months'),
('1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'parking', 'dedicated', 'Виділені місця для паркування біля входу', true, 5, true, 'd5e7bf9c-8c8f-4b4a-a2d0-6e23d0e4a94b', NOW() - INTERVAL '5 months'),

-- McDonalds Хрещатик
('2f3a4b5c-6d7e-8f9a-0b1c-2d3e4f5a6b7c', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'ramp', 'permanent', 'Пандус при вході до ресторану', true, 5, true, '7a6bb89e-31d5-4c3a-bda3-7c9f3b9315ce', NOW() - INTERVAL '1 month'),
('3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'accessible_toilet', 'standard', 'Доступний туалет', true, 5, true, '7a6bb89e-31d5-4c3a-bda3-7c9f3b9315ce', NOW() - INTERVAL '1 month');

-- 5. Додаємо відгуки
INSERT INTO reviews (id, location_id, user_id, rating, comment, accessibility_experience, moderation_status, created_at) VALUES
-- ЦНАП Шевченківського району
('a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'f1b45b7a-e68f-4e42-9eb5-39a3825ea97c', 4, 'Зручний доступ, персонал дуже допоміг', 'Пандус зручний, але трохи крутий. Ліфт чистий та місткий.', 'approved', NOW() - INTERVAL '2 months'),
('b2b3b4b5-c2c3-d2d3-e2e3-f2f3g2g3h2h3', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'a8912c5e-7f2b-4d8a-b1d6-8c4eea9d2790', 5, 'Дуже доступний центр, все продумано', 'Зручний пандус, просторий ліфт, доступний туалет. Все чудово адаптовано.', 'approved', NOW() - INTERVAL '1 month'),

-- Міністерство цифрової трансформації
('c3c4c5c6-d3d4-e3e4-f3f4-g3g4h3h4i3i4', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'f1b45b7a-e68f-4e42-9eb5-39a3825ea97c', 5, 'Зразково доступне приміщення', 'Повністю адаптовано для людей з будь-якими особливостями доступу. Працівники уважні та готові допомогти.', 'approved', NOW() - INTERVAL '2 weeks'),

-- Епіцентр Київ Полярна
('d4d5d6d7-e4e5-f4f5-g4g5-h4h5i4i5j4j5', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'a8912c5e-7f2b-4d8a-b1d6-8c4eea9d2790', 4, 'Зручний для відвідування з візком', 'Просторі проходи, є ліфти, персонал готовий допомогти. Єдине - іноді в проходах стоять товари, що ускладнює рух.', 'approved', NOW() - INTERVAL '3 months'),

-- McDonalds Хрещатик
('e5e6e7e8-f5f6-g5g6-h5h6-i5i6j5j6k5k6', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'f1b45b7a-e68f-4e42-9eb5-39a3825ea97c', 5, 'Повністю доступний ресторан', 'Зручний вхід з пандусом, просторий зал, доступний туалет. Все на вищому рівні.', 'approved', NOW() - INTERVAL '3 weeks');

-- 6. Додаємо верифікації
INSERT INTO verifications (id, location_id, feature_id, verified_by, organization_id, status, comment, created_at, is_official) VALUES
-- ЦНАП - пандус
('a1a1a1a1-b1b1-c1c1-d1d1-e1e1f1f1g1g1', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', '1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d', '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', '91e17dcb-b239-469e-acdc-4ade1066391c', true, 'Пандус відповідає нормам ДБН, має поручні з обох сторін', NOW() - INTERVAL '1 month', true),

-- Міністерство - ліфт
('b2b2b2b2-c2c2-d2d2-e2e2-f2f2g2g2h2h2', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', '5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b', '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', '91e17dcb-b239-469e-acdc-4ade1066391c', true, 'Ліфт просторий, має звукові сигнали та тактильні кнопки', NOW() - INTERVAL '2 weeks', true),

-- Епіцентр - паркування
('c3c3c3c3-d3d3-e3e3-f3f3-g3g3h3h3i3i3', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', '1e2f3a4b-5c6d-7e8f-9a0b-1c2d3e4f5a6b', '3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d', '91e17dcb-b239-469e-acdc-4ade1066391c', true, 'Паркувальні місця відповідають стандартам, правильно позначені', NOW() - INTERVAL '3 months', true);

-- 7. Додаємо тестові сповіщення
INSERT INTO notifications (id, user_id, type, title, message, link, is_read, created_at) VALUES
('a0a0a0
