import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import { createAuditLog } from '../utils/auditLogger';

export async function getBeltLevels(req: AuthRequest, res: Response) {
  try {
    const beltLevels = await prisma.beltLevel.findMany({
      orderBy: { geupRank: 'desc' },
    });
    return res.json({ success: true, data: beltLevels });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createBeltLevel(req: AuthRequest, res: Response) {
  try {
    const { name, geupRank, badgeColor, examFeeDefault, requirements, description } = req.body;

    if (!name || geupRank === undefined) {
      return res.status(400).json({ success: false, message: 'Nama sabuk dan urutan peringkat (geupRank) wajib diisi.' });
    }

    const belt = await prisma.beltLevel.create({
      data: {
        name,
        geupRank: Number(geupRank),
        badgeColor: badgeColor || '#E2E8F0',
        examFeeDefault: Number(examFeeDefault) || 0,
        requirements,
        description,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'TINGKATAN_SABUK',
      entityId: belt.id,
      details: `Menambah tingkatan sabuk baru: ${name} (Rank: ${geupRank})`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Tingkatan sabuk berhasil ditambahkan.', data: belt });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteBeltLevel(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const belt = await prisma.beltLevel.findUnique({ where: { id } });

    if (!belt) {
      return res.status(404).json({ success: false, message: 'Tingkatan sabuk tidak ditemukan.' });
    }

    await prisma.beltLevel.delete({ where: { id } });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'DELETE',
      entity: 'TINGKATAN_SABUK',
      entityId: id,
      details: `Menghapus tingkatan sabuk ${belt.name}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Tingkatan sabuk berhasil dihapus.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateBeltLevel(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, geupRank, badgeColor, examFeeDefault, requirements, description } = req.body;

    const existing = await prisma.beltLevel.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Tingkatan sabuk tidak ditemukan.' });
    }

    const updated = await prisma.beltLevel.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        geupRank: geupRank !== undefined ? Number(geupRank) : existing.geupRank,
        badgeColor: badgeColor !== undefined ? badgeColor : existing.badgeColor,
        examFeeDefault: examFeeDefault !== undefined ? Number(examFeeDefault) : existing.examFeeDefault,
        requirements: requirements !== undefined ? requirements : existing.requirements,
        description: description !== undefined ? description : existing.description,
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'UPDATE',
      entity: 'TINGKATAN_SABUK',
      entityId: id,
      details: `Memperbarui tingkatan sabuk ${updated.name}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Tingkatan sabuk berhasil diperbarui.', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function getBeltExams(req: AuthRequest, res: Response) {
  try {
    const exams = await prisma.beltExam.findMany({
      include: {
        results: {
          include: {
            member: true,
            targetBelt: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
    return res.json({ success: true, data: exams });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createBeltExam(req: AuthRequest, res: Response) {
  try {
    const { title, date, location, examiner, feeAmount, description } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({ success: false, message: 'Judul, tanggal, dan lokasi ujian wajib diisi.' });
    }

    const exam = await prisma.beltExam.create({
      data: {
        title,
        date: new Date(date),
        location,
        examiner,
        feeAmount: Number(feeAmount) || 0,
        description,
        status: 'JADWAL',
      },
    });

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'UJIAN_SABUK',
      entityId: exam.id,
      details: `Membuat jadwal ujian sabuk: ${title}`,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, message: 'Jadwal ujian sabuk berhasil dibuat.', data: exam });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function submitExamResult(req: AuthRequest, res: Response) {
  try {
    const { beltExamId, memberId, targetBeltId, score, result, notes } = req.body;

    if (!beltExamId || !memberId || !targetBeltId) {
      return res.status(400).json({ success: false, message: 'beltExamId, memberId, dan targetBeltId wajib diisi.' });
    }

    const certNo = result === 'LULUS' ? `CERT-HKD-${Date.now().toString().slice(-6)}` : null;

    const examResult = await prisma.beltExamResult.create({
      data: {
        beltExamId,
        memberId,
        targetBeltId,
        score: score ? Number(score) : null,
        result: result || 'MENUNGGU',
        certificateNo: certNo,
        notes,
      },
    });

    // If passed, update member's current belt & record history
    if (result === 'LULUS') {
      await prisma.member.update({
        where: { id: memberId },
        data: { currentBeltId: targetBeltId },
      });

      await prisma.memberBeltHistory.create({
        data: {
          memberId,
          beltLevelId: targetBeltId,
          examDate: new Date(),
          certificateNo: certNo,
          notes: notes || 'Lulus Ujian Kenaikan Sabuk',
        },
      });

      // Generate Certificate record
      const member = await prisma.member.findUnique({ where: { id: memberId } });
      const targetBelt = await prisma.beltLevel.findUnique({ where: { id: targetBeltId } });

      if (member && certNo) {
        await prisma.certificate.create({
          data: {
            certificateNo: certNo,
            type: 'UJIAN_SABUK',
            title: `Sertifikat Kenaikan Sabuk (${targetBelt?.name})`,
            recipientName: member.fullName,
            issueDate: new Date(),
            memberId: member.id,
            signedBy: 'Master Hapkido Indonesia',
          },
        });
      }
    }

    await createAuditLog({
      userId: req.user?.id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE',
      entity: 'HASIL_UJIAN_SABUK',
      entityId: examResult.id,
      details: `Input hasil ujian sabuk untuk member ${memberId}: ${result}`,
      ipAddress: req.ip,
    });

    return res.json({ success: true, message: 'Hasil ujian sabuk berhasil disimpan.', data: examResult });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
