const cors_proxy = require('./lib/cors-anywhere');

// Grab the blacklist from environment variables
const originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
const originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);

// Function to parse the environment variable list
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(',');
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
const checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);

// Create the CORS Anywhere server
const corsAnywhereServer = cors_proxy.createServer({
  originBlacklist,
  originWhitelist,
  requireHeader: ['origin', 'x-requested-with'],
  checkRateLimit,
  removeHeaders: [
    'cookie',
    'cookie2',
    'x-request-start',
    'x-request-id',
    'via',
    'connect-time',
    'total-route-time',
  ],
  redirectSameOrigin: true,
  httpProxyOptions: {
    xfwd: false,
  },
});

// Export the serverless function
module.exports = (req, res) => {
  corsAnywhereServer.emit('request', req, res);
};
