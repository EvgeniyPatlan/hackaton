// next-i18next.config.js
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'uk'], // Add the languages you support
  },
  localePath: typeof window === 'undefined'
    ? require('path').resolve('./public/locales')
    : '/locales',
};
