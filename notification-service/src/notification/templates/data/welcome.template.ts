export default {
  name: 'welcome',
  type: 'SYSTEM',
  subject: 'Ласкаво просимо до Безбар\'єрний доступ України',
  htmlBody: `
    <div>
      <h1>Вітаємо, {{firstName}}!</h1>
      <p>Ми раді, що ви приєдналися до платформи "Безбар'єрний доступ України".</p>
      <p>Тепер ви можете:</p>
      <ul>
        <li>Додавати та оцінювати локації</li>
        <li>Шукати доступні місця поруч з вами</li>
        <li>Ділитися інформацією про доступність</li>
      </ul>
      <p>Якщо у вас виникнуть питання, будь ласка, зв'яжіться з нами.</p>
      <p>З повагою,<br>Команда Безбар'єрного доступу України</p>
    </div>
  `,
  textBody: `
    Вітаємо, {{firstName}}!
    
    Ми раді, що ви приєдналися до платформи "Безбар'єрний доступ України".
    
    Тепер ви можете:
    - Додавати та оцінювати локації
    - Шукати доступні місця поруч з вами
    - Ділитися інформацією про доступність
    
    Якщо у вас виникнуть питання, будь ласка, зв'яжіться з нами.
    
    З повагою,
    Команда Безбар'єрного доступу України
  `,
};
