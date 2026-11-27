try {
  process.loadEnvFile?.();
} catch {
  // .env not present (e.g. production on Render); env vars come from platform
}

