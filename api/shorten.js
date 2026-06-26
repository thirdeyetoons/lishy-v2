import { Redis } from '@upstash/redis';
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { url, slug } = req.body;
  // Use custom slug if provided, otherwise generate random
  const id = slug || Math.random().toString(36).substring(2, 8);
  
  // Check if slug is already taken
  const exists = await redis.exists(id);
  if (exists && slug) return res.status(400).json({ error: 'Slug already taken' });

  await redis.set(id, url);
  res.status(200).json({ shortUrl: `${req.headers['x-forwarded-proto']}://${req.headers.host}/${id}` });
}
