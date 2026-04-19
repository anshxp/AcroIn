// Legacy entrypoint kept for compatibility. Delegates to ESM migration.
import('./migrate-project-references.js').catch((error) => {
  console.error('Migration bootstrap failed:', error);
  process.exit(1);
});
