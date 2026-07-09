import { Router } from 'express';

const router = Router();

router.get('/assets', (req, res) => {
  res.json({ message: 'Map assets GeoJSON - to be implemented' });
});

router.get('/routes', (req, res) => {
  res.json({ message: 'Map routes GeoJSON - to be implemented' });
});

router.get('/employees', (req, res) => {
  res.json({ message: 'Live employee locations - to be implemented' });
});

router.get('/search', (req, res) => {
  res.json({ message: 'Map search - to be implemented' });
});

router.get('/bounds', (req, res) => {
  res.json({ message: 'Map bounds - to be implemented' });
});

export default router;