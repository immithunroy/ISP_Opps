import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List TJ boxes - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create TJ box - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get TJ box - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update TJ box - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete TJ box - to be implemented' });
});

router.get('/:id/maintenance', (req, res) => {
  res.json({ message: 'Get TJ box maintenance - to be implemented' });
});

router.post('/:id/maintenance', (req, res) => {
  res.json({ message: 'Add TJ box maintenance - to be implemented' });
});

export default router;