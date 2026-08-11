import { prisma } from '../db';
import { sendSocketNotificationToUser, broadcastSocketNotification } from './socketService';

interface CreateNotificationInput {
  userId?: string;
  targetUserId?: string; // Legacy or explicit target
  title: string;
  message: string;
  type?: 'LATIHAN_REMINDER' | 'PENGUMUMAN' | 'EVENT' | 'PEMBAYARAN' | 'GENERAL' | string;
  linkUrl?: string;
}

// Create Notification record in Postgres and push real-time event via Socket.io
export async function createAndSendNotification(input: CreateNotificationInput) {
  try {
    const targetUid = input.userId || input.targetUserId;

    const notification = await prisma.notification.create({
      data: {
        userId: targetUid || null,
        targetUserId: targetUid || null,
        title: input.title,
        message: input.message,
        type: input.type || 'GENERAL',
        linkUrl: input.linkUrl || null,
      },
    });

    if (targetUid) {
      sendSocketNotificationToUser(targetUid, notification);
    } else {
      broadcastSocketNotification(notification);
    }

    return notification;
  } catch (error: any) {
    console.error('Error creating notification:', error.message);
    return null;
  }
}

// Helper to notify all parents of active members in a specific Dojang
export async function notifyDojangParents(dojangId: string, title: string, message: string, linkUrl?: string) {
  try {
    const parentLinks = await prisma.parentChild.findMany({
      where: {
        member: { dojangId },
      },
      select: { parentId: true },
    });

    const uniqueParentIds = Array.from(new Set(parentLinks.map((p) => p.parentId)));

    for (const pId of uniqueParentIds) {
      await createAndSendNotification({
        userId: pId,
        title,
        message,
        type: 'LATIHAN_REMINDER',
        linkUrl,
      });
    }
  } catch (error: any) {
    console.error('Error notifying dojang parents:', error.message);
  }
}

// Helper to notify all trainers of a specific Dojang
export async function notifyDojangTrainers(dojangId: string, title: string, message: string, linkUrl?: string) {
  try {
    const trainers = await prisma.trainer.findMany({
      where: { dojangId },
      select: { userId: true },
    });

    for (const t of trainers) {
      if (t.userId) {
        await createAndSendNotification({
          userId: t.userId,
          title,
          message,
          type: 'LATIHAN_REMINDER',
          linkUrl,
        });
      }
    }
  } catch (error: any) {
    console.error('Error notifying dojang trainers:', error.message);
  }
}
