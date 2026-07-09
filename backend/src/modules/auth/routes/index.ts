import { Router } from 'express';

const router = Router();

router.post('/login', (req, res) => {
  res.json({ message: 'Login - to be implemented' });
});

router.post('/refresh', (req, res) => {
  res.json({ message: 'Refresh token - to be implemented' });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logout - to be implemented' });
});

router.get('/me', (req, res) => {
  res.json({ message: 'Get current user - to be implemented' });
});

router.post('/change-password', (req, res) => {
  res.json({ message: 'Change password - to be implemented' });
});

export default router;