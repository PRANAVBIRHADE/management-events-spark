import { MetadataRoute } from 'next';
import { dbConnect } from '@/lib/mongodb';
import Event from '@/models/Event';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();
  const events = await Event.find({}, '_id updatedAt');
  const base = 'https://localhost:3000';
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/` },
    { url: `${base}/events` },
  ];
  const eventRoutes: MetadataRoute.Sitemap = events.map((e: any) => ({ url: `${base}/events/${e._id}`, lastModified: e.updatedAt }));
  return [...staticRoutes, ...eventRoutes];
}
