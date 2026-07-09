import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List employees - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create employee - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get employee - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update employee - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete employee - to be implemented' });
});

router.post('/:id/photo', (req, res) => {
  res.json({ message: 'Upload employee photo - to be implemented' });
});

export default router;