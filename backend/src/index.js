/**
 * Compatibility entry point for deployments or scripts that still reference
 * backend/src/index.js. Keep server startup and route registration centralized
 * in backend/server.js so the two entry points cannot drift apart.
 */
import '../server.js';
