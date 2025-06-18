#!/usr/bin/env node

/**
 * PASSENGER STARTUP FILE FOR DOMÍNIOS.PT
 * 
 * This file is required by Passenger (mod_passenger) to start the Node.js application.
 * It should be referenced as the "Application startup file" in the hosting control panel.
 */

// Load environment variables
require('dotenv').config();

console.log('[PASSENGER] Starting IDEA E-commerce application...');
console.log('[PASSENGER] Node version:', process.version);
console.log('[PASSENGER] Environment:', process.env.NODE_ENV || 'development');

// Ensure production mode for hosting
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Import and start the main server
const app = require('./server.cjs');

// Passenger will handle the port automatically
// But we can set a default if running standalone
const PORT = process.env.PORT || 3000;

console.log('[PASSENGER] Application loaded successfully');
console.log('[PASSENGER] Listening on port:', PORT);

// Export the app for Passenger
module.exports = app; 