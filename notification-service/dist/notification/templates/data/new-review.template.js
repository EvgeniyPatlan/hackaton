"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: 'new_review',
    type: 'REVIEW',
    subject: 'Новий відгук про вашу локацію',
    htmlBody: `
    <div>
      <h1>Новий відгук</h1>
      <p>Користувач залишив новий відгук про вашу локацію <strong>{{locationName}}</strong>.</p>
      <p><strong>Рейтинг:</strong> {{rating}} з 5</p>
      <p><strong>Коментар:</strong> {{comment}}</p>
      <p>Ви можете переглянути всі відгуки на сторінці вашої локації.</p>
      <p>З повагою,<br>Команда Безбар'єрного доступу України</p>
    </div>
  `,
    textBody: `
    Новий відгук
    
    Користувач залишив новий відгук про вашу локацію "{{locationName}}".
    
    Рейтинг: {{rating}} з 5
    
    Коментар: {{comment}}
    
    Ви можете переглянути всі відгуки на сторінці вашої локації.
    
    З повагою,
    Команда Безбар'єрного доступу України
  `,
};
//# sourceMappingURL=new-review.template.js.map