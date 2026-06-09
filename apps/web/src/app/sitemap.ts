import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dogeland.vn';
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/leaderboard`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/forum`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${baseUrl}/wiki`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/rules`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/store`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/vote`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${baseUrl}/status`, lastModified: now, changeFrequency: 'always', priority: 0.9 },
    { url: `${baseUrl}/support`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ];

  return staticPages;
}
