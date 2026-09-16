const { join } = require("path");

/**
 * Keep Puppeteer's Chrome inside node_modules. Netlify caches node_modules between
 * builds but not ~/.cache, so without this the prerender step loses Chrome and the
 * site ships an empty HTML shell.
 */
module.exports = {
  cacheDirectory: join(__dirname, "node_modules", ".cache", "puppeteer"),
};
