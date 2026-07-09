import { Router } from 'express';

const router = Router();

router.get('/export/:type', (req, res) => {
  res.json({ message: 'Export data - to be implemented' });
});

router.post('/import/:type', (req, res) => {
  res.json({ message: 'Import data - to be implemented' });
});

router.get('/template/:type', (req, res) => {
  res.json({ message: 'Download template - to be implemented' });
});

export default router;