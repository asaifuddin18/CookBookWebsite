import { awsCredentialsProvider } from '@vercel/oidc-aws-credentials-provider';

/**
 * Returns partial AWS client config:
 * - On Vercel (AWS_ROLE_ARN set): injects OIDC credentials
 * - Locally: returns empty object, letting the SDK use the default credential
 *   chain (1Password shell plugin injects AWS_ACCESS_KEY_ID/SECRET via `op run --`)
 */
export function getAwsClientConfig() {
  if (process.env.AWS_ROLE_ARN) {
    return { credentials: awsCredentialsProvider({ roleArn: process.env.AWS_ROLE_ARN }) };
  }
  return {};
}
