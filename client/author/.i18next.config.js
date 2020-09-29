module.exports = {
  createOldCatalogs: false,
  input: "src/**/*.{js,jsx}",
  locales: ["en"],
  output: "public/locales/$LOCALE/$NAMESPACE.json",
  sort: true,
};
