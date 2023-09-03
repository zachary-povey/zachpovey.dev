/**
 * Environments variables declared here.
 */

/* eslint-disable node/no-process-env */

function getRequiredEnvVar(envVarName: string): string {
  const envVarValue = process.env[envVarName]
  if (!envVarValue) {
    throw Error(`Required environment variable '${envVarName}' not set`)
  }

  return envVarValue
}

export default {
  NodeEnv: getRequiredEnvVar("NODE_ENV"),
  Port: getRequiredEnvVar("PORT"),
  MailgunDomain: getRequiredEnvVar("MAILGUN_DOMAIN"),
  MailgunApiKey: getRequiredEnvVar("MAILGUN_API_KEY"),
  AdminEmail: getRequiredEnvVar("ADMIN_EMAIL"),
} as const
