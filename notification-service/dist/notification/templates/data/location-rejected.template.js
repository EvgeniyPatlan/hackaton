"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: 'location_rejected',
    type: 'LOCATION_MODERATION',
    subject: 'Вашу локацію відхилено',
    htmlBody: `
    <div>
      <h1>Локацію відхилено</h1>
      <p>На жаль, локація <strong>{{locationName}}</strong>, яку ви додали, не пройшла модерацію.</p>
      <p><strong>Причина:</strong> {{reason}}</p>
      <p>Ви можете оновити дані локації та відправити її на повторну модерацію.</p>
      <p>Якщо у вас є питання, будь ласка, зв'яжіться з нами.</p>
      <p>З повагою,<br>Команда Безбар'єрного доступу України</p>
    </div>
  `,
    textBody: `
    Локацію відхилено
    
    На жаль, локація "{{locationName}}", яку ви додали, не пройшла модерацію.
    
    Причина: {{reason}}
    
    Ви можете оновити дані локації та відправити її на повторну модерацію.
    
    Якщо у вас є питання, будь ласка, зв'яжіться з нами.
    
    З повагою,
    Команда Безбар'єрного доступу України
  `,
};
//# sourceMappingURL=location-rejected.template.js.map