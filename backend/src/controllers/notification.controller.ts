import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

// Get current user notifications & unread count
export async function getMyNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { userId },
          { targetUserId: userId },
          { userId: null, targetUserId: null }, // Global broadcast notifications
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        OR: [
          { userId },
          { targetUserId: userId },
          { userId: null, targetUserId: null },
        ],
        isRead: false,
      },
    });

    return res.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Mark single notification as read
export async function markNotificationAsRead(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.json({ success: true, data: notification });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// Mark all notifications as read for current user
export async function markAllNotificationsAsRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: {
        OR: [
          { userId },
          { targetUserId: userId },
          { userId: null, targetUserId: null },
        ],
        isRead: false,
      },
      data: { isRead: true },
    });

    return res.json({ success: true, message: 'Semua notifikasi ditandai telah dibaca.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
