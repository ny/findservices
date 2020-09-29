module.exports = {
  createOldCatalogs: false,
  input: "src/**/*.{js,jsx}",
  locales: ["bn", "en", "es", "ht", "ko", "ru", "zh"],
  output: "public/locales/$LOCALE/$NAMESPACE.json",
  sort: true,
};
