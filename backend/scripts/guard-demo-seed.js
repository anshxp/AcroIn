const LOCAL_MONGO_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/**
 * Prevent demo fixtures from overwriting real accounts or production data.
 * Remote non-production databases require an explicit opt-in.
 */
export const assertDemoSeedAllowed = (mongoUri) => {
  if (String(process.env.NODE_ENV || '').toLowerCase() === 'production') {
    throw new Error('Demo seed scripts are disabled when NODE_ENV=production.');
  }

  let hostname = '';
  try {
    hostname = new URL(mongoUri).hostname.toLowerCase();
  } catch {
    throw new Error('A valid MongoDB connection URI is required for demo seeding.');
  }

  if (!LOCAL_MONGO_HOSTS.has(hostname) && process.env.ALLOW_REMOTE_DEMO_SEED !== 'true') {
    throw new Error(
      'Refusing to seed a remote MongoDB database. Use a local database or explicitly set ALLOW_REMOTE_DEMO_SEED=true for a disposable non-production database.'
    );
  }
};
