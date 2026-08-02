import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function openAttendanceSession(req: AuthRequest, res: Response) {
  try {
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ success: false, message: 'scheduleId wajib diisi.' });
    }

    const schedule = await prisma.trainingSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Jadwal latihan tidak ditemukan.' });
    }

    // Check if session already open
    const existingSession = await prisma.attendanceSession.findFirst({
      where: { scheduleId, status: 'OPEN' },
    });

    if (existingSession) {
      return res.json({ success: true, message: 'Sesi absensi sudah terbuka.', data: existingSession });
    }

    const session = await prisma.attendanceSession.create({
      data: {
        scheduleId,
        openedById: req.user?.id,
        status: 'OPEN',
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'SESI_ABSENSI',
      entityId: session.id,
      details: `Membuka sesi absensi untuk jadwal ${schedule.title}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Sesi absensi berhasil dibuka.', data: session });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAttendanceSession(req: AuthRequest, res: Response) {
  try {
    const { sessionId } = req.params;
    const session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        schedule: {
          include: { class: true, trainer: { include: { user: true } } },
        },
        records: {
          include: { member: true },
          orderBy: { checkInTime: 'desc' },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Sesi absensi tidak ditemukan.' });
    }

    return res.json({ success: true, data: session });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function scanQrCheckIn(req: AuthRequest, res: Response) {
  try {
    const { sessionId, qrData, status, notes } = req.body;

    if (!sessionId || !qrData) {
      return res.status(400).json({ success: false, message: 'sessionId dan qrData wajib diisi.' });
    }

    // Find member by NIA or ID from QR Data
    const member = await prisma.member.findFirst({
      where: {
        OR: [{ nia: qrData }, { id: qrData }],
      },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: 'Kartu QR Anggota tidak terdaftar.' });
    }

    // Check if already checked in
    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: { sessionId, memberId: member.id },
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: `Anggota ${member.fullName} (${member.nia}) sudah melakukan presensi pada sesi ini.`,
        data: existingRecord,
      });
    }

    const record = await prisma.attendanceRecord.create({
      data: {
        sessionId,
        memberId: member.id,
        status: status || 'HADIR',
        notes: notes || 'Presensi via Scan QR Code',
        recordedBy: req.user?.name || 'Pelatih/Admin',
      },
      include: { member: true },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'ABSENSI_QR',
      entityId: record.id,
      details: `Scan QR presensi anggota ${member.fullName} (${member.nia}) - Status: ${record.status}`,
      ipAddress: req.ip,
    });

    return res.json({
      success: true,
      message: `Presensi berhasil! ${member.fullName} (${member.nia}) - Status: ${record.status}`,
      data: record,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function recordManualAttendance(req: AuthRequest, res: Response) {
  try {
    const { sessionId, memberId, status, notes } = req.body;

    if (!sessionId || !memberId || !status) {
      return res.status(400).json({ success: false, message: 'sessionId, memberId, dan status wajib diisi.' });
    }

    const member = await prisma.member.findUnique({ where: { id: memberId } });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan.' });
    }

    // Upsert attendance record
    const existing = await prisma.attendanceRecord.findFirst({
      where: { sessionId, memberId },
    });

    let record;
    if (existing) {
      record = await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: { status, notes, recordedBy: req.user?.name },
        include: { member: true },
      });
    } else {
      record = await prisma.attendanceRecord.create({
        data: {
          sessionId,
          memberId,
          status,
          notes,
          recordedBy: req.user?.name,
        },
        include: { member: true },
      });
    }

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: existing ? 'UPDATE' : 'CREATE',
      entity: 'ABSENSI_MANUAL',
      entityId: record.id,
      details: `Input manual presensi ${member.fullName} (${member.nia}) - Status: ${status}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Status presensi berhasil disimpan.', data: record });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function closeAttendanceSession(req: AuthRequest, res: Response) {
  try {
    const { sessionId } = req.params;

    const session = await prisma.attendanceSession.update({
      where: { id: sessionId },
      data: { status: 'CLOSED' },
    });

    return res.json({ success: true, message: 'Sesi absensi ditutup.', data: session });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
