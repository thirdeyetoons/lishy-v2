import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  // Ensure URL has a protocol
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  const id = Math.random().toString(36).substring(2, 8);
  
  await redis.set(id, fullUrl);
  
  const host = req.headers.host;
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  res.status(200).json({ shortUrl: `${protocol}://${host}/${id}` });
}
