import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

export const authRouter = Router();

// Public routes
authRouter.post('/register-company', AuthController.registerCompany);
authRouter.post('/login', AuthController.login);
authRouter.post('/refresh', AuthController.refresh);

// Protected routes
authRouter.post('/logout', authenticate, AuthController.logout);
authRouter.get('/me', authenticate, AuthController.getMe);
authRouter.post('/2fa/setup', authenticate, AuthController.setupTwoFactor);
authRouter.post('/2fa/verify', authenticate, AuthController.verifyTwoFactor);
