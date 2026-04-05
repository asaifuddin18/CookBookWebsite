import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';

/**
 * Returns AWS credentials:
 * - On Vercel (AWS_ROLE_ARN set): uses OIDC federation via @vercel/oidc-aws-credentials-provider
 * - Locally: returns undefined, letting the AWS SDK pick up credentials from
 *   the 1Password shell plugin or the default credential chain
 */
export function getAwsCredentials() {
  if (process.env.AWS_ROLE_ARN) {
    return awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN });
  }
  return undefined;
}
