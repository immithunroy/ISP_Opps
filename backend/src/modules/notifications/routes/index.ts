import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Notifications - to be implemented' });
});

router.patch('/:id/read', (req, res) => {
  res.json({ message: 'Mark notification as read - to be implemented' });
});

router.patch('/read-all', (req, res) => {
  res.json({ message: 'Mark all notifications as read - to be implemented' });
});

router.get('/unread-count', (req, res) => {
  res.json({ message: 'Unread count - to be implemented' });
});

export default router;