// app.js - Entry point for Passenger
// This file serves as the Passenger entry point and imports the main Express app

require('dotenv').config();

// Import the main Express application
const app = require('./server.cjs');

// Passenger compatibility
if (typeof(PhusionPassenger) !== 'undefined') {
    PhusionPassenger.configure({ autoInstall: false });
}

// Log startup information
console.log('[APP.JS] Alitools.pt application starting...');
console.log('[APP.JS] Node.js version:', process.version);
console.log('[APP.JS] Environment:', process.env.NODE_ENV || 'development');
console.log('[APP.JS] Port configuration:', process.env.PORT || 3001);

// Export the app for Passenger
module.exports = app; 