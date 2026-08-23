module.exports = {
  hooks: {
    readPackage(pkg) {
      if (pkg.name === '@tailwindcss/oxide' || pkg.name === 'esbuild') {
        // Don't filter out any scripts for these packages
        if (pkg.scripts) {
          Object.keys(pkg.scripts).forEach(script => {
            // Ensure scripts are preserved
          });
        }
      }
      return pkg;
    },
  },
};
