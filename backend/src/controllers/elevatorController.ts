import { Router } from 'express';

const router = Router();

router.get('/status', (_req, res) => {
  res.json({ message: 'Use WebSocket for real-time updates' });
});

export default router;