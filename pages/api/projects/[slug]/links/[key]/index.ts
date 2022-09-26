import { NextApiRequest, NextApiResponse } from 'next';

import { withProjectAuth } from '@/lib/auth';
import { deleteLink, editLink } from '@/lib/redis';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  const { domain, key: oldKey } = req.query as {
    domain: string;
    key: string;
  };

  if (req.method === 'PUT') {
    const { key, url, title, timestamp, description, image } = req.body;
    if (!key || !url || !title || !timestamp) {
      return res.status(400).json({ error: 'Missing key or url or title or timestamp' });
    }
    const response = await editLink(domain, oldKey, key, {
      url,
      title,
      timestamp,
      description,
      image
    });
    if (response === null) {
      return res.status(400).json({ error: 'Key already exists' });
    }
    return res.status(200).json(response);
  } else if (req.method === 'DELETE') {
    const response = await Promise.all([deleteLink(domain, oldKey)]);
    return res.status(200).json(response);
  } else {
    res.setHeader('Allow', ['POST', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
});
