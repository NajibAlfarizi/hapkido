import { Response } from 'express';
import { prisma } from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export async function getCertificates(req: AuthRequest, res: Response) {
  try {
    const certs = await prisma.certificate.findMany({
      include: { member: true },
      orderBy: { issueDate: 'desc' },
    });
    return res.json({ success: true, data: certs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createCertificate(req: AuthRequest, res: Response) {
  try {
    const { type, title, recipientName, signedBy, memberId } = req.body;

    if (!title || !recipientName) {
      return res.status(400).json({ success: false, message: 'Judul sertifikat dan nama penerima wajib diisi.' });
    }

    const certificateNo = `CERT-HKD-${Date.now().toString().slice(-6)}`;

    const cert = await prisma.certificate.create({
      data: {
        certificateNo,
        type: type || 'PESERTA',
        title,
        recipientName,
        signedBy: signedBy || 'Master Hapkido Indonesia',
        memberId: memberId || null,
        issueDate: new Date(),
      },
    });

    return res.status(201).json({ success: true, message: 'Sertifikat berhasil dibuat.', data: cert });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
