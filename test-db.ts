import db from './src/lib/db.ts';
try {
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log('Database connection successful, users count:', users);
  process.exit(0);
} catch (err) {
  console.error('Database connection failed:', err);
  process.exit(1);
}
