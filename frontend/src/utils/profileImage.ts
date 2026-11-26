const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getProfileImageUrl = (
  image: string | null | undefined,
  cacheBuster?: string | number,
): string | null => {
  if (!image) return null;

  try {
    const normalizedImage = image.trim().replace(/\\/g, '/');
    const match = normalizedImage.match(
      /(?:^|\/)(uploads\/(?:avatars|profiles)\/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp))(?:[?#].*)?$/i,
    );
    if (!match) return null;

    const baseUrl = apiBaseUrl.startsWith('/')
      ? window.location.origin
      : apiBaseUrl;
    const url = new URL(`/${match[1]}`, baseUrl);
    if (cacheBuster !== undefined) {
      url.searchParams.set('t', String(cacheBuster));
    }
    return url.toString();
  } catch {
    return null;
  }
};
