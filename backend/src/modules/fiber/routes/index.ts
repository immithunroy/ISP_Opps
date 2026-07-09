import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List fiber routes - to be implemented' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create fiber route - to be implemented' });
});

router.get('/geojson', (req, res) => {
  res.json({ message: 'Get fiber routes as GeoJSON - to be implemented' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Get fiber route - to be implemented' });
});

router.patch('/:id', (req, res) => {
  res.json({ message: 'Update fiber route - to be implemented' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Delete fiber route - to be implemented' });
});

export default router;