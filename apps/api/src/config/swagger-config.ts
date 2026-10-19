export function shouldEnableSwagger(environment: NodeJS.ProcessEnv = process.env) {
  return environment.NODE_ENV === 'production' && environment.SWAGGER_ENABLED === 'true';
}
