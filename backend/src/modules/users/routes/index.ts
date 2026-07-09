import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List users - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create user - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get user - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update user - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete user - to be implemented' });
});

router.post('/:id/reset-password', (req, res) => {
  res.json({ message: 'Reset user password - to be implemented' });
});

export default router;