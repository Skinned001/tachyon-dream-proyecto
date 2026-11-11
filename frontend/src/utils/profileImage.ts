const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getProfileImageUrl = (
  image: string | null | undefined,
  cacheBuster?: string | number,
): string | null => {
  if (!image) return null;

  try {
    const url = new URL(image, apiBaseUrl);
    if (cacheBuster !== undefined) {
      url.searchParams.set('t', String(cacheBuster));
    }
    return url.toString();
  } catch {
    return image;
  }
};
