export function assertProductionConfig(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== 'production') return;
  const errors: string[] = [];
  if (!env.DATABASE_URL) errors.push('DATABASE_URL');
  if (!env.PUBLIC_WEB_URL?.startsWith('https://')) errors.push('PUBLIC_WEB_URL (https)');
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32 || env.JWT_SECRET === 'local-development-secret-change-me') errors.push('JWT_SECRET (at least 32 characters)');
  if (errors.length) throw new Error(`Missing or unsafe production configuration: ${errors.join(', ')}`);
}
