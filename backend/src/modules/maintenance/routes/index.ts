import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List maintenance - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create maintenance - to be implemented' });
});

router.get('/upcoming', (req, res) => {
  res.json({ message: 'Upcoming maintenance - to be implemented' });
});

router.get('/overdue', (req, res) => {
  res.json({ message: 'Overdue maintenance - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get maintenance - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update maintenance - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete maintenance - to be implemented' });
});

export default router;