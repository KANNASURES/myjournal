require('dotenv').config();

const app                = require('./app');
const config             = require('./config/config');
const { testConnection } = require('./config/db');

const PORT = config.server.port;

async function startServer() {
  console.log('\n✦ Starting Lumio API server...');
  console.log(`  Environment: ${config.server.nodeEnv}`);

  await testConnection();

  app.listen(PORT, function () {
    console.log(`\n✦ Server running at http://localhost:${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log(`  Auth API:     http://localhost:${PORT}/api/auth`);
    console.log(`  Journal API:  http://localhost:${PORT}/api/journal`);
    console.log('\n  Press Ctrl+C to stop\n');
  });
}

process.on('unhandledRejection', function (err) {
  console.error('✗ Unhandled rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', function (err) {
  console.error('✗ Uncaught exception:', err.message);
  process.exit(1);
});

startServer();