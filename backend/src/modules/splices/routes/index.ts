import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List splices - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create splice - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get splice - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update splice - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete splice - to be implemented' });
});

export default router;