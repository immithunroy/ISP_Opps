import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List assets - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create asset - to be implemented' });
});

router.get('/stats', (req, res) => {
  res.json({ message: 'Get asset stats - to be implemented' });
});

router.get('/nearby', (req, res) => {
  res.json({ message: 'Get nearby assets - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get asset - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update asset - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete asset - to be implemented' });
});

router.post('/:id/photos', (req, res) => {
  res.json({ message: 'Upload asset photos - to be implemented' });
});

router.delete('/:id/photos/:photoId', (req, res) => {
  res.json({ message: 'Delete asset photo - to be implemented' });
});

export default router;