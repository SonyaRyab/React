import { API_BASE } from "../api/config";

const MINIO_BASE_URL = API_BASE;

export function getMediaUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;

  if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
    return fileName;
  }

  return `${MINIO_BASE_URL}/${fileName}`;
}