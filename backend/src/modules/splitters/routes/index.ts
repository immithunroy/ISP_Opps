import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List splitters - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create splitter - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get splitter - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update splitter - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete splitter - to be implemented' });
});

router.get('/:id/outputs', (req, res) => {
  res.json({ message: 'Get splitter outputs - to be implemented' });
});

router.post('/:id/outputs/:outputId/connect', (req, res) => {
  res.json({ message: 'Connect splitter output - to be implemented' });
});

export default router;