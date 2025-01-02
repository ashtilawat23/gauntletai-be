import express, { Request, Response } from 'express';
import { Webhook } from 'svix';
import pool from '../../config/database';
import logger from '../../utils/logger';
import { ClerkWebhookEvent } from '../../types/clerk';

const router = express.Router();

const verifyClerkWebhook = (req: Request, headerPayload: string, payload: string) => {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('Missing Clerk webhook secret');
  }

  const wh = new Webhook(webhookSecret);
  return wh.verify(payload, { 'svix-signature': headerPayload }) as ClerkWebhookEvent;
};

router.post('/clerk', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  try {
    const headerPayload = req.headers['svix-signature'] as string;
    if (!headerPayload) {
      res.status(401).json({ error: 'Missing svix-signature header' });
      return;
    }

    const payload = req.body.toString();
    const event = verifyClerkWebhook(req, headerPayload, payload);

    // Event data is now typed
    const { id, email_addresses, first_name, last_name } = event.data;
    
    switch (event.type) {
      case 'user.created': {
        const primaryEmail = email_addresses[0]?.email_address;

        await pool.query(
          `INSERT INTO users (clerk_id, email, name, role)
           VALUES ($1, $2, $3, $4)`,
          [id, primaryEmail, `${first_name || ''} ${last_name || ''}`.trim(), 'student']
        );

        logger.info('User created from Clerk webhook', { 
          clerkId: id, 
          email: primaryEmail,
          name: `${first_name || ''} ${last_name || ''}`.trim()
        });
        break;
      }

      case 'user.updated': {
        const primaryEmail = email_addresses[0]?.email_address;

        await pool.query(
          `UPDATE users 
           SET email = $2, name = $3
           WHERE clerk_id = $1`,
          [id, primaryEmail, `${first_name || ''} ${last_name || ''}`.trim()]
        );

        logger.info('User updated from Clerk webhook', { 
          clerkId: id,
          email: primaryEmail,
          name: `${first_name || ''} ${last_name || ''}`.trim()
        });
        break;
      }

      case 'user.deleted': {
        await pool.query(
          'DELETE FROM users WHERE clerk_id = $1',
          [id]
        );

        logger.info('User deleted from Clerk webhook', { clerkId: id });
        break;
      }
    }

    res.json({ success: true });
  } catch (error) {
    logger.error('Error processing Clerk webhook:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;