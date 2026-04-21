const MINIO_BASE_URL = 'http://localhost:9000/logo';

export function getMediaUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;

  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    return fileName;
  }

  return `${MINIO_BASE_URL}/${fileName}`;
}