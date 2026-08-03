import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';
import * as authCtrl from '../controllers/auth.controller';
import * as memberCtrl from '../controllers/member.controller';
import * as trainerCtrl from '../controllers/trainer.controller';
import * as beltCtrl from '../controllers/belt.controller';
import * as scheduleCtrl from '../controllers/schedule.controller';
import * as attendanceCtrl from '../controllers/attendance.controller';
import * as paymentCtrl from '../controllers/payment.controller';
import * as expenseCtrl from '../controllers/expense.controller';
import * as financeCtrl from '../controllers/finance.controller';
import * as announcementCtrl from '../controllers/announcement.controller';
import * as eventCtrl from '../controllers/event.controller';
import * as inventoryCtrl from '../controllers/inventory.controller';
import * as certCtrl from '../controllers/certificate.controller';
import * as reportCtrl from '../controllers/report.controller';
import * as settingCtrl from '../controllers/setting.controller';
import * as auditCtrl from '../controllers/audit.controller';
import * as dojangCtrl from '../controllers/dojang.controller';

const router = Router();

// Public routes
router.post('/auth/login', authCtrl.login);

// Protected routes (Admin & Pelatih)
router.use(authenticateToken);

// Dojang Branches
router.get('/dojangs', dojangCtrl.getDojangs);
router.post('/dojangs', authorizeRoles('ADMIN'), dojangCtrl.createDojang);
router.put('/dojangs/:id', authorizeRoles('ADMIN'), dojangCtrl.updateDojang);
router.delete('/dojangs/:id', authorizeRoles('ADMIN'), dojangCtrl.deleteDojang);

// Auth & Profile
router.get('/auth/me', authCtrl.getProfile);
router.post('/auth/change-password', authCtrl.changePassword);
router.post('/auth/reset-password', authorizeRoles('ADMIN'), authCtrl.resetPasswordAdmin);

// Members
router.get('/members', memberCtrl.getMembers);
router.get('/members/:id', memberCtrl.getMemberById);
router.post('/members', authorizeRoles('ADMIN'), memberCtrl.createMember);
router.put('/members/:id', authorizeRoles('ADMIN'), memberCtrl.updateMember);
router.delete('/members/:id', authorizeRoles('ADMIN'), memberCtrl.deleteMember);

// Trainers
router.get('/trainers', trainerCtrl.getTrainers);
router.post('/trainers', authorizeRoles('ADMIN'), trainerCtrl.createTrainer);
router.put('/trainers/:id', authorizeRoles('ADMIN'), trainerCtrl.updateTrainer);
router.delete('/trainers/:id', authorizeRoles('ADMIN'), trainerCtrl.deleteTrainer);

// Belt Levels & Exams
router.get('/belts', beltCtrl.getBeltLevels);
router.post('/belts', authorizeRoles('ADMIN'), beltCtrl.createBeltLevel);
router.put('/belts/:id', authorizeRoles('ADMIN'), beltCtrl.updateBeltLevel);
router.delete('/belts/:id', authorizeRoles('ADMIN'), beltCtrl.deleteBeltLevel);
router.get('/belts/exams', beltCtrl.getBeltExams);
router.post('/belts/exams', authorizeRoles('ADMIN'), beltCtrl.createBeltExam);
router.post('/belts/results', authorizeRoles('ADMIN', 'PELATIH'), beltCtrl.submitExamResult);

// Training Classes & Schedules
router.get('/schedules/classes', scheduleCtrl.getClasses);
router.post('/schedules/classes', authorizeRoles('ADMIN'), scheduleCtrl.createClass);
router.get('/schedules', scheduleCtrl.getSchedules);
router.post('/schedules', authorizeRoles('ADMIN', 'PELATIH'), scheduleCtrl.createSchedule);
router.delete('/schedules/:id', authorizeRoles('ADMIN'), scheduleCtrl.deleteSchedule);

// Attendance (QR & Manual)
router.post('/attendance/session/open', authorizeRoles('ADMIN', 'PELATIH'), attendanceCtrl.openAttendanceSession);
router.get('/attendance/session/:sessionId', attendanceCtrl.getAttendanceSession);
router.put('/attendance/session/:sessionId/close', authorizeRoles('ADMIN', 'PELATIH'), attendanceCtrl.closeAttendanceSession);
router.post('/attendance/scan', authorizeRoles('ADMIN', 'PELATIH'), attendanceCtrl.scanQrCheckIn);
router.post('/attendance/manual', authorizeRoles('ADMIN', 'PELATIH'), attendanceCtrl.recordManualAttendance);

// Dues & Payments
router.get('/dues/types', paymentCtrl.getDuesTypes);
router.post('/dues/types', authorizeRoles('ADMIN'), paymentCtrl.createDuesType);
router.get('/payments', paymentCtrl.getPayments);
router.post('/payments', authorizeRoles('ADMIN'), paymentCtrl.createPayment);
router.put('/payments/:id/cancel', authorizeRoles('ADMIN'), paymentCtrl.cancelPayment);

// Expenses
router.get('/expenses', authorizeRoles('ADMIN'), expenseCtrl.getExpenses);
router.post('/expenses', authorizeRoles('ADMIN'), expenseCtrl.createExpense);
router.delete('/expenses/:id', authorizeRoles('ADMIN'), expenseCtrl.deleteExpense);

// Finance & Summary
router.get('/finance/summary', authorizeRoles('ADMIN'), financeCtrl.getFinancialSummary);

// Announcements & Events
router.get('/announcements', announcementCtrl.getAnnouncements);
router.post('/announcements', authorizeRoles('ADMIN'), announcementCtrl.createAnnouncement);
router.get('/events', eventCtrl.getEvents);
router.post('/events', authorizeRoles('ADMIN'), eventCtrl.createEvent);
router.post('/events/register', authorizeRoles('ADMIN'), eventCtrl.registerMemberForEvent);

// Inventory
router.get('/inventory', authorizeRoles('ADMIN'), inventoryCtrl.getInventory);
router.post('/inventory', authorizeRoles('ADMIN'), inventoryCtrl.createInventory);
router.put('/inventory/:id/stock', authorizeRoles('ADMIN'), inventoryCtrl.updateInventoryStock);

// Certificates
router.get('/certificates', certCtrl.getCertificates);
router.post('/certificates', authorizeRoles('ADMIN'), certCtrl.createCertificate);

// Comprehensive Reports
router.get('/reports/dashboard', reportCtrl.getComprehensiveReport);

// Settings
router.get('/settings', settingCtrl.getDojangSettings);
router.put('/settings', authorizeRoles('ADMIN'), settingCtrl.updateDojangSettings);

// Audit Logs
router.get('/audit-logs', authorizeRoles('ADMIN'), auditCtrl.getAuditLogs);

export default router;
