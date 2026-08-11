import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

import { createAndSendNotification } from '../services/notificationService';

export async function getAnnouncements(req: AuthRequest, res: Response) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
    return res.json({ success: true, data: announcements });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createAnnouncement(req: AuthRequest, res: Response) {
  try {
    const { title, content, category, isPinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Judul dan isi pengumuman wajib diisi.' });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        category: category || 'UMUM',
        isPinned: Boolean(isPinned),
        createdById: req.user?.id,
      },
    });

    // Broadcast real-time notification to all users
    await createAndSendNotification({
      title: `📢 Pengumuman Baru: ${title}`,
      message: content.length > 100 ? `${content.substring(0, 100)}...` : content,
      type: 'PENGUMUMAN',
      linkUrl: '/pengumuman',
    });

    return res.status(201).json({ success: true, message: 'Pengumuman berhasil dipublikasikan.', data: announcement });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
