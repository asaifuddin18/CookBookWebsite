import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getAwsClientConfig } from './awsCredentials';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...getAwsClientConfig(),
});

const BUCKET = process.env.S3_BUCKET_NAME || '';
const REGION = process.env.AWS_REGION || 'us-east-1';

export async function getPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<{ uploadUrl: string; imageUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const imageUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

  return { uploadUrl, imageUrl };
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const prefix = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
  if (!imageUrl.startsWith(prefix)) return;

  const key = imageUrl.slice(prefix.length);
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
