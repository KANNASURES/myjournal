/* ═══════════════════════════════════════════════════════════
   LUMIO — DATABASE CONNECTION
   Creates a MySQL connection pool.
   Pool = multiple connections managed automatically.
   Much better than a single connection for production.
═══════════════════════════════════════════════════════════ */

const mysql  = require('mysql2/promise');
const config = require('./config');

// Create connection pool
const pool = mysql.createPool({
  host:               config.db.host,
  port:               config.db.port,
  user:               config.db.user,
  password:           config.db.password,
  database:           config.db.name,
  waitForConnections: true,
  connectionLimit:    10,       // max 10 simultaneous connections
  queueLimit:         0,        // unlimited queue
  timezone:           '+00:00', // store all times as UTC
  charset:            'utf8mb4' // supports emojis
});

/* ─────────────────────────────────────────────────────────
   testConnection — call once on server startup to verify
   the database is reachable before accepting requests.
───────────────────────────────────────────────────────── */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✦ MySQL connected successfully');
    console.log(`  Host: ${config.db.host}:${config.db.port}`);
    console.log(`  Database: ${config.db.name}`);
    connection.release(); // return connection to pool
  } catch (err) {
    console.error('✗ MySQL connection failed:', err.message);
    console.error('  Check your .env DB_* settings and MySQL Workbench.');
    process.exit(1); // stop server if DB is unreachable
  }
}

module.exports = { pool, testConnection };