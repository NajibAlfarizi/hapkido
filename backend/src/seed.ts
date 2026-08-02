import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Dojang Hapkido multi-dojang database seeding...');

  // 1. Seed Dojang Branches
  const dojangsData = [
    {
      code: 'JKT',
      name: 'Dojang Hapkido Pusat Jakarta',
      address: 'Jl. Olahraga Martial Arts No. 88, Kebayoran Baru, Jakarta Selatan',
      phone: '0812-9988-7766',
      email: 'jakarta@dojanghapkido.id',
      headTrainerName: 'Master Sabum Nim',
      status: 'AKTIF',
    },
    {
      code: 'BDG',
      name: 'Dojang Hapkido Cabang Bandung',
      address: 'Jl. Dago Asri No. 45, Coblong, Bandung',
      phone: '0812-3344-5566',
      email: 'bandung@dojanghapkido.id',
      headTrainerName: 'Sabeum Budi Santoso',
      status: 'AKTIF',
    },
    {
      code: 'SBY',
      name: 'Dojang Hapkido Cabang Surabaya',
      address: 'Jl. Pemuda No. 12, Genteng, Surabaya',
      phone: '0812-7788-9900',
      email: 'surabaya@dojanghapkido.id',
      headTrainerName: 'Sabeum Agus Setiawan',
      status: 'AKTIF',
    },
  ];

  const dojangMap = new Map();
  for (const d of dojangsData) {
    const existing = await prisma.dojang.findUnique({ where: { code: d.code } });
    if (!existing) {
      const created = await prisma.dojang.create({ data: d });
      dojangMap.set(d.code, created.id);
    } else {
      dojangMap.set(d.code, existing.id);
    }
  }

  const jktId = dojangMap.get('JKT');
  const bdgId = dojangMap.get('BDG');
  const sbyId = dojangMap.get('SBY');

  // 2. Seed Dojang Settings
  await prisma.dojangSetting.upsert({
    where: { id: 'DEFAULT' },
    update: {},
    create: {
      id: 'DEFAULT',
      dojangName: 'PERGURUAN BELADIRI HAPKIDO INDONESIA',
      logoUrl: '',
      address: 'Jl. Olahraga Martial Arts No. 88, Jakarta',
      phone: '0812-9988-7766',
      email: 'admin@hapkido-dojang.id',
      academicPeriod: '2026/2027',
      defaultMonthlyFee: 150000,
      defaultPracticeDays: 'Selasa, Kamis, Sabtu (16.00 - 18.00 WIB)',
      headerText: 'PERGURUAN BELADIRI HAPKIDO INDONESIA',
      footerReceiptText: 'Kuitansi Resmi Dojang Hapkido. Terima kasih atas pembayaran Anda!',
    },
  });

  // 3. Seed Default Belt Levels
  const beltLevels = [
    { name: 'Sabuk Putih (Geup 10)', geupRank: 10, badgeColor: '#E2E8F0', examFeeDefault: 100000, requirements: 'Teknik dasar kuda-kuda, pukulan (Jireugi), tendangan depan (Ap Chagi).' },
    { name: 'Sabuk Kuning (Geup 9)', geupRank: 9, badgeColor: '#FACC15', examFeeDefault: 125000, requirements: 'Jatuhan (Nakbop), Kuncian pergelangan tangan (Hoshinsool 1-5).' },
    { name: 'Sabuk Hijau (Geup 8)', geupRank: 8, badgeColor: '#22C55E', examFeeDefault: 150000, requirements: 'Tendangan memutar (Dollyo Chagi), Hoshinsool kemeja/pakaian 1-5.' },
    { name: 'Sabuk Biru (Geup 7)', geupRank: 7, badgeColor: '#3B82F6', examFeeDefault: 175000, requirements: 'Kuncian tangkapan (Sambeop), tendangan samping (Yop Chagi).' },
    { name: 'Sabuk Merah (Geup 6)', geupRank: 6, badgeColor: '#EF4444', examFeeDefault: 200000, requirements: 'Tendangan belakang (Dwit Chagi), tangkapan pisau/senjata tajam.' },
    { name: 'Sabuk Merah Strip (Geup 5)', geupRank: 5, badgeColor: '#B91C1C', examFeeDefault: 225000, requirements: 'Kombinasi 3 tendangan udara, Hoshinsool tingkat lanjut.' },
    { name: 'Sabuk Hitam (Dan 1)', geupRank: 0, badgeColor: '#0F172A', examFeeDefault: 500000, requirements: 'Hyung (Kata) Dan 1, aplikasi beladiri praktis, ujian fisik & mental.' },
  ];

  for (const b of beltLevels) {
    const existing = await prisma.beltLevel.findFirst({ where: { geupRank: b.geupRank } });
    if (!existing) {
      await prisma.beltLevel.create({ data: b });
    }
  }

  const whiteBelt = await prisma.beltLevel.findFirst({ where: { geupRank: 10 } });
  const yellowBelt = await prisma.beltLevel.findFirst({ where: { geupRank: 9 } });

  // 4. Seed Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const pelatihPassword = await bcrypt.hash('pelatih123', 10);

  const adminUser = await prisma.user.upsert({
    where: { username: 'hapkidopadangpanjang' },
    update: {
      passwordHash: adminPassword,
    },
    create: {
      username: 'hapkidopadangpanjang',
      passwordHash: adminPassword,
      name: 'Admin Hapkido Padang Panjang',
      role: 'ADMIN',
      email: 'admin@hapkidopadangpanjang.id',
      phone: '08123456789',
    },
  });

  const pelatihUser = await prisma.user.upsert({
    where: { username: 'pelatih' },
    update: {},
    create: {
      username: 'pelatih',
      passwordHash: pelatihPassword,
      name: 'Sabeum Budi Santoso',
      role: 'PELATIH',
      email: 'budi@hapkido.id',
      phone: '08129876543',
    },
  });

  // Trainer profile
  const trainer = await prisma.trainer.upsert({
    where: { userId: pelatihUser.id },
    update: {},
    create: {
      userId: pelatihUser.id,
      dojangId: jktId,
      specialty: 'Spesialis Kuncian Hoshinsool & Tendangan Kombinasi',
      bio: 'Pelatih Berlisensi Dan 3 Hapkido Indonesia',
      isHead: true,
      status: 'AKTIF',
    },
  });

  // 5. Seed Dues Types
  const duesTypes = [
    { name: 'Iuran Bulanan Anggota', category: 'BULANAN', defaultAmount: 150000, description: 'Iuran latihan bulanan reguler' },
    { name: 'Iuran Ujian Sabuk Kuning', category: 'UJIAN_SABUK', defaultAmount: 125000, description: 'Biaya pendaftaran & sertifikat ujian sabuk' },
    { name: 'Iuran Pendaftaran Kejuaraan', category: 'EVENT', defaultAmount: 250000, description: 'Biaya pendaftaran event kejuaraan Hapkido' },
    { name: 'Biaya Seragam (Dobok)', category: 'LAINNYA', defaultAmount: 300000, description: 'Pembelian Dobok resmi Hapkido' },
  ];

  for (const d of duesTypes) {
    const existing = await prisma.duesType.findFirst({ where: { name: d.name } });
    if (!existing) {
      await prisma.duesType.create({ data: d });
    }
  }

  // 6. Seed Members with Dojang Branch Isolation
  const sampleMembers = [
    {
      nia: 'HKD-JKT-2026-001',
      dojangId: jktId,
      fullName: 'Ahmad Raihan',
      nickname: 'Raihan',
      gender: 'LAKILAKI',
      birthPlace: 'Jakarta',
      birthDate: new Date('2010-05-14'),
      phone: '081311112222',
      email: 'raihan@gmail.com',
      address: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta',
      status: 'AKTIF',
      parentName: 'Hendra Gunawan',
      parentPhone: '081399998888',
      parentJob: 'Wiraswasta',
      emergencyContact: '081399998888 (Ayah)',
      currentBeltId: yellowBelt?.id,
    },
    {
      nia: 'HKD-BDG-2026-001',
      dojangId: bdgId,
      fullName: 'Siti Nurhaliza',
      nickname: 'Siti',
      gender: 'PEREMPUAN',
      birthPlace: 'Bandung',
      birthDate: new Date('2012-08-20'),
      phone: '081333334444',
      email: 'siti@gmail.com',
      address: 'Jl. Cempaka No. 45, Dago, Bandung',
      status: 'AKTIF',
      parentName: 'Bambang Pratama',
      parentPhone: '081377776666',
      parentJob: 'PNS',
      emergencyContact: '081377776666 (Bapak)',
      currentBeltId: whiteBelt?.id,
    },
    {
      nia: 'HKD-SBY-2026-001',
      dojangId: sbyId,
      fullName: 'Kevin Sanjaya',
      nickname: 'Kevin',
      gender: 'LAKILAKI',
      birthPlace: 'Surabaya',
      birthDate: new Date('2008-01-10'),
      phone: '081355556666',
      email: 'kevin@gmail.com',
      address: 'Jl. Pemuda No. 88, Surabaya',
      status: 'AKTIF',
      parentName: 'Rudi Sanjaya',
      parentPhone: '081366665555',
      parentJob: 'Karyawan Swasta',
      emergencyContact: '081366665555 (Ayah)',
      currentBeltId: yellowBelt?.id,
    },
  ];

  for (const m of sampleMembers) {
    const existing = await prisma.member.findUnique({ where: { nia: m.nia } });
    if (!existing) {
      await prisma.member.create({ data: m });
    }
  }

  // 7. Seed Recurring Practice Schedules per Dojang
  const sampleSchedules = [
    {
      dojangId: jktId,
      trainerId: trainer.id,
      dayOfWeek: 'SELASA',
      startTime: '16:00',
      endTime: '18:00',
      title: 'Latihan Rutin Selasa - Dojang Jakarta',
      location: 'Dojang Pusat Hall A',
      notes: 'Materi: Pemantapan Nakbop & Hoshinsool Dasar',
    },
    {
      dojangId: jktId,
      trainerId: trainer.id,
      dayOfWeek: 'KAMIS',
      startTime: '16:00',
      endTime: '18:00',
      title: 'Latihan Rutin Kamis - Dojang Jakarta',
      location: 'Dojang Pusat Hall A',
      notes: 'Materi: Pendalaman Tendangan Kombinasi & Sparring',
    },
    {
      dojangId: bdgId,
      dayOfWeek: 'RABU',
      startTime: '16:00',
      endTime: '18:00',
      title: 'Latihan Rutin Rabu - Dojang Bandung',
      location: 'Gor Hapkido Bandung',
      notes: 'Materi: Fisik Dasar & Kuncian Pergelangan',
    },
    {
      dojangId: sbyId,
      dayOfWeek: 'SABTU',
      startTime: '09:00',
      endTime: '11:00',
      title: 'Latihan Rutin Sabtu - Dojang Surabaya',
      location: 'Dojang Cabang Surabaya Utama',
      notes: 'Materi: Kurikulum Sabuk Geup & Hyung 1',
    },
  ];

  for (const s of sampleSchedules) {
    const existing = await prisma.trainingSchedule.findFirst({ where: { title: s.title } });
    if (!existing) {
      await prisma.trainingSchedule.create({ data: s });
    }
  }

  console.log('✅ Multi-dojang seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
