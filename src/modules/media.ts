import { imgproxyaddr } from "../target_config";

export function getMediaUrl(fileName?: string): string | undefined {
  if (!fileName) return undefined;

  if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
    return fileName;
  }

  const cleanBase = imgproxyaddr.replace(/\/+$/, "");
  const cleanPath = fileName.replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
}