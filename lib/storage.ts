import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

function createS3Client(): S3Client {
  return new S3Client({
    region: process.env.REGION ?? 'auto',
    endpoint: process.env.ENDPOINT ?? 'https://storage.railway.app',
    credentials: {
      accessKeyId: process.env.ACCESS_KEY_ID!,
      secretAccessKey: process.env.SECRET_ACCESS_KEY!,
    },
  })
}

// Lazily initialised so missing env vars only throw at call-time, not at build-time.
let _s3: S3Client | null = null
export function s3(): S3Client {
  _s3 ??= createS3Client()
  return _s3
}

function bucket(): string {
  return process.env.BUCKET!
}

export async function uploadImage(
  file: Buffer,
  filePath: string,
  contentType: string,
): Promise<string> {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket(),
      Key: filePath,
      Body: file,
      ContentType: contentType,
    }),
  )
  return `/api/files/${filePath}`
}

export async function deleteImage(filePath: string): Promise<void> {
  await s3().send(
    new DeleteObjectCommand({
      Bucket: bucket(),
      Key: filePath,
    }),
  )
}
