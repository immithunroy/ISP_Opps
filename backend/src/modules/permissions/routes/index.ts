import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'List permissions - to be implemented' });
});

export default router;