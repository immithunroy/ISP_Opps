import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List roles - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create role - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get role - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update role - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete role - to be implemented' });
});

router.post('/:id/permissions', (req, res) => {
  res.json({ message: 'Assign permissions to role - to be implemented' });
});

export default router;