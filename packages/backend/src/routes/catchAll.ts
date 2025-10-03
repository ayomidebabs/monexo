import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();
router.get('*', (req: Request, res: Response) => {
  console.log('in catch all', req.user);
  // return res.sendFile(path.join(process.cwd(), 'client/build/index.html'));
  return;
});

export default router;
