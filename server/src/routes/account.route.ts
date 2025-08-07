import express from 'express';
import { AccountController } from '../controller/account.controller';
import { authMiddleware, roleMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', roleMiddleware(['Admin', 'Manager', 'Agent']), AccountController.listAccounts);
router.post('/', roleMiddleware(['Admin', 'Manager']), AccountController.createAccount);
router.get('/:id', roleMiddleware(['Admin', 'Manager', 'Agent', 'Viewer']), AccountController.getAccount);
router.put('/:id', roleMiddleware(['Admin', 'Manager']), AccountController.updateAccount);
router.delete('/:id', roleMiddleware(['Admin']), AccountController.deleteAccount);
router.post('/bulk-update', roleMiddleware(['Admin']), AccountController.bulkUpdate);
router.post('/search', roleMiddleware(['Admin', 'Manager', 'Agent']), AccountController.advancedSearch);

export default router;