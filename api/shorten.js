import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const { url, slug } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    // Generate or use custom slug
    const id = slug ? slug.trim() : Math.random().toString(36).substring(2, 8);

    // Check if custom slug is taken
    if (slug) {
      const exists = await redis.exists(id);
      if (exists) return res.status(400).json({ error: 'Slug already taken' });
    }

    await redis.set(id, url);
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    
    return res.status(200).json({ shortUrl: `${protocol}://${host}/${id}` });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
