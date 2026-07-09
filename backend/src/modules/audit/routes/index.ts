import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Audit logs - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get audit log - to be implemented' });
});

export default router;