// Disabled temporary database-inspection script.
// The original script printed user records including password hashes.
// Use an approved, least-privilege diagnostic query and never log credential hashes.
console.error('[temp-query] Disabled because it exposed credential hashes in console output.');
process.exitCode = 1;
