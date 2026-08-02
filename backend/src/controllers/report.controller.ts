import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function getComprehensiveReport(req: AuthRequest, res: Response) {
  try {
    const totalMembers = await prisma.member.count();
    const activeMembers = await prisma.member.count({ where: { status: 'AKTIF' } });
    const inactiveMembers = await prisma.member.count({ where: { status: 'NONAKTIF' } });

    const totalTrainers = await prisma.trainer.count({ where: { status: 'AKTIF' } });

    // Today's attendance
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayAttendanceCount = await prisma.attendanceRecord.count({
      where: {
        checkInTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    // Payments metrics
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const paymentsThisMonth = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: startOfMonth },
        status: { in: ['LUNAS', 'SEBAGIAN'] },
      },
    });

    const incomeThisMonth = paymentsThisMonth.reduce((acc, curr) => acc + curr.paidAmount, 0);

    const unpaidPayments = await prisma.payment.findMany({
      where: { status: { in: ['BELUM_BAYAR', 'SEBAGIAN'] } },
    });

    const totalArrears = unpaidPayments.reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);

    // Recent announcements
    const recentAnnouncements = await prisma.announcement.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Active training schedules
    const upcomingSchedules = await prisma.trainingSchedule.findMany({
      where: { status: 'AKTIF' },
      include: { class: true, trainer: { include: { user: true } } } as any,
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        totalTrainers,
        todayAttendanceCount,
        incomeThisMonth,
        totalArrears,
        recentAnnouncements,
        upcomingSchedules,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
