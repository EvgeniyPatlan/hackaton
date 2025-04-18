"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: 'location_approved',
    type: 'LOCATION_MODERATION',
    subject: 'Вашу локацію затверджено',
    htmlBody: `
    <div>
      <h1>Локацію затверджено!</h1>
      <p>Вітаємо! Локація <strong>{{locationName}}</strong>, яку ви додали, успішно пройшла модерацію.</p>
      <p>Тепер ця локація доступна для всіх користувачів платформи.</p>
      <p>Дякуємо за ваш внесок у покращення доступності України!</p>
      <p>З повагою,<br>Команда Безбар'єрного доступу України</p>
    </div>
  `,
    textBody: `
    Локацію затверджено!
    
    Вітаємо! Локація "{{locationName}}", яку ви додали, успішно пройшла модерацію.
    
    Тепер ця локація доступна для всіх користувачів платформи.
    
    Дякуємо за ваш внесок у покращення доступності України!
    
    З повагою,
    Команда Безбар'єрного доступу України
  `,
};
//# sourceMappingURL=location-approved.template.js.map