// Disabled legacy seed script.
// This script inserts accounts with shared weak passwords and has no environment guard.
// Use the guarded demo seeder instead: npm run seed:demo
console.error('[seed] Disabled for safety. Use npm run seed:demo with a local DEMO_SEED_PASSWORD.');
process.exitCode = 1;
