import cron from 'node-cron';
import { prisma } from '../db';
import { notifyDojangParents, notifyDojangTrainers } from './notificationService';

const DAY_NAMES_ID: { [key: number]: string } = {
  0: 'MINGGU',
  1: 'SENIN',
  2: 'SELASA',
  3: 'RABU',
  4: 'KAMIS',
  5: 'JUMAT',
  6: 'SABTU',
};

export function startScheduler() {
  console.log('⏰ Starting Automated Cron Scheduler for Training Reminders...');

  // 1. Cron Job: Run every day at 18:00 WIB (6:00 PM) for H-1 Reminders
  cron.schedule('0 18 * * *', async () => {
    try {
      console.log('🔔 Running H-1 Training Reminder Cron Job...');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDayName = DAY_NAMES_ID[tomorrow.getDay()];

      const schedules = await prisma.trainingSchedule.findMany({
        where: {
          status: 'AKTIF',
          dayOfWeek: tomorrowDayName,
        },
        include: { dojang: true },
      });

      for (const sched of schedules) {
        const dojangName = sched.dojang?.name || 'Dojang Hapkido';
        const title = `📢 Pengingat Latihan H-1 (${sched.title})`;
        const message = `Besok (Hari ${tomorrowDayName}) ada jadwal latihan rutin ${sched.title} pukul ${sched.startTime || '16:00'} WIB di ${sched.location || dojangName}.`;

        if (sched.dojangId) {
          await notifyDojangParents(sched.dojangId, title, message, '/orangtua');
          await notifyDojangTrainers(sched.dojangId, title, message, '/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Error in H-1 training reminder cron:', error.message);
    }
  });

  // 2. Cron Job: Run every 30 minutes to check 1-Hour before Training Sesi Today
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date();
      const todayDayName = DAY_NAMES_ID[now.getDay()];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const schedules = await prisma.trainingSchedule.findMany({
        where: {
          status: 'AKTIF',
          dayOfWeek: todayDayName,
        },
        include: { dojang: true },
      });

      for (const sched of schedules) {
        if (!sched.startTime) continue;
        const [schedHourStr, schedMinStr] = sched.startTime.split(':');
        const schedHour = parseInt(schedHourStr, 10);
        const schedMin = parseInt(schedMinStr || '0', 10);

        // Check if start time is approximately 1 hour from now (45 to 75 minutes ahead)
        const diffMinutes = (schedHour * 60 + schedMin) - (currentHour * 60 + currentMinute);

        if (diffMinutes >= 45 && diffMinutes <= 75) {
          const dojangName = sched.dojang?.name || 'Dojang Hapkido';
          const title = `⏰ Pengingat: 1 Jam Lagi Latihan ${sched.title}`;
          const message = `Sesi latihan ${sched.title} di ${sched.location || dojangName} akan dimulai 1 jam lagi (pukul ${sched.startTime} WIB). Mohon bersiap-siap!`;

          if (sched.dojangId) {
            await notifyDojangParents(sched.dojangId, title, message, '/orangtua');
            await notifyDojangTrainers(sched.dojangId, title, message, '/absensi');
          }
        }
      }
    } catch (error: any) {
      console.error('Error in 1-hour training reminder cron:', error.message);
    }
  });

  console.log('✅ Cron Scheduler Service initialized successfully.');
}
