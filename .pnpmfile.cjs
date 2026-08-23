function readPackage(pkg) {
  if (pkg.name === '@tailwindcss/oxide' || pkg.name === 'esbuild') {
    pkg.scripts = pkg.scripts || {};
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
