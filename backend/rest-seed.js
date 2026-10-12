// Deprecated legacy REST seeder.
// Its /api routes and payloads no longer match the canonical backend routes.
// Use the maintained, guarded demo seeder instead: npm run seed:demo.
console.error(
  '[rest-seed] This legacy seeder is disabled because its API contract is obsolete. ' +
  'Use "npm run seed:demo" against a disposable, non-production database.'
);
process.exitCode = 1;
