import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notification.controller';

const router = Router();

router.use(authenticateToken);

router.get('/', getMyNotifications);
router.put('/read-all', markAllNotificationsAsRead);
router.put('/:id/read', markNotificationAsRead);

export default router;
