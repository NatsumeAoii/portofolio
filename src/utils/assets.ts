import { APP_CONFIG } from '@/data/config';

export const getAssetPath = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Remove leading dot if present
    const cleanPath = path.startsWith('./') ? path.slice(1) : path;

    // Ensure path starts with /
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    // If path already contains base path, return it
    if (normalizedPath.startsWith(APP_CONFIG.basePath)) return normalizedPath;

    return `${APP_CONFIG.basePath}${normalizedPath}`;
};
