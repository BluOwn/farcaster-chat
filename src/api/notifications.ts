// src/api/notifications.ts
// This file can be deployed as a serverless function on Vercel

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Define notification types
type NotificationPayload = {
  user: {
    fid: number;
  };
  type: 'NEW_MESSAGE' | 'MENTION' | 'SYSTEM';
  title: string;
  body: string;
  url?: string;
  timestamp: number;
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get notification registration data from request
    const { fid, notificationToken } = request.body;

    if (!fid || !notificationToken) {
      return response.status(400).json({ error: 'Missing required parameters' });
    }

    // Here, you would typically store the notification token in your database
    // associated with the user's FID
    console.log(`Registered notification token for FID ${fid}: ${notificationToken}`);

    // Mock implementation - in a real app, store this in a database
    const mockStorage = new Map<number, string>();
    mockStorage.set(fid, notificationToken);

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Error registering notification token:', error);
    return response.status(500).json({ error: 'Internal server error' });
  }
}

// Example function to send a notification (would be called from your backend)
export async function sendNotification(
  fid: number, 
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Retrieve the notification token for the FID from your database
    // 2. Call the Farcaster notification API or use a push notification service
    
    // This is a mock implementation
    const notificationEndpoint = 'https://api.warpcast.com/v2/notifications';
    
    const response = await fetch(notificationEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WARPCAST_API_KEY}`
      },
      body: JSON.stringify({
        fid: payload.user.fid,
        notification: {
          type: payload.type,
          title: payload.title,
          body: payload.body,
          url: payload.url,
          timestamp: payload.timestamp
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to send notification: ${response.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}