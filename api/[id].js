// import { Redis } from '@upstash/redis';

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// export default async function handler(req, res) {
//   const { id } = req.query;
//   const longUrl = await redis.get(id);

//   if (longUrl) {
//     return res.redirect(longUrl);
//   } else {
//     return res.status(404).send('URL not found');
//   }
// }

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  // Extract ID and remove any potential trailing slash
  // req.query.id captures the dynamic segment from the URL
  let { id } = req.query;
  
  if (!id) return res.status(400).send("ID is missing");
  
  // Clean the ID
  id = Array.isArray(id) ? id[0] : id;
  const cleanId = id.replace(/\/$/, "");

  try {
    const longUrl = await redis.get(cleanId);

    if (longUrl) {
      // Perform the redirect
      return res.redirect(longUrl);
    } else {
      // If the ID doesn't exist in Redis
      return res.status(404).send('URL not found');
    }
  } catch (error) {
    console.error('Redirect Error:', error);
    return res.status(500).send('Internal Server Error');
  }
}
