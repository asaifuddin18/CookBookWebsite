import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';

/**
 * Returns AWS credentials:
 * - On Vercel (AWS_ROLE_ARN set): uses OIDC federation via @vercel/oidc-aws-credentials-provider
 * - Locally: uses access key from environment variables
 */
export function getAwsCredentials() {
  if (process.env.AWS_ROLE_ARN) {
    return awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN });
  }
  return {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  };
}
