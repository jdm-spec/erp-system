import { Request, Response, NextFunction } from 'express';
import { generateSecret, generateURI, verifySync } from 'otplib';
import { AuthService } from './auth.service.js';
import { loginSchema, registerCompanySchema, verifyTwoFactorSchema } from './auth.schemas.js';
import { env } from '../../config/env.js';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middleware/errorHandler.js';
import { ApiResponse } from '@erp/shared-types';

const REFRESH_COOKIE_NAME = 'erp_refresh_token';

function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/v1/auth',
  });
}

export class AuthController {
  public static async registerCompany(req: Request, res: Response, next: NextFunction) {
    try {
      const data = registerCompanySchema.parse(req.body);
      const { session, refreshToken } = await AuthService.registerCompany(data);

      setRefreshTokenCookie(res, refreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Company and administrator registered successfully',
        data: session,
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, twoFactorToken } = loginSchema.parse(req.body);
      const result = await AuthService.login(email, password, twoFactorToken);

      if (result.requiresTwoFactor) {
        return res.status(200).json({
          success: true,
          message: 'Two-factor authentication code required',
          data: { requiresTwoFactor: true },
        });
      }

      if (result.refreshToken) {
        setRefreshTokenCookie(res, result.refreshToken);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: result.session,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME] || req.body.refreshToken;
      if (!token) {
        throw new AppError(401, 'MISSING_REFRESH_TOKEN', 'No refresh token provided');
      }

      const { session, newRefreshToken } = await AuthService.refreshAccessToken(token);
      setRefreshTokenCookie(res, newRefreshToken);

      const response: ApiResponse = {
        success: true,
        message: 'Access token refreshed successfully',
        data: session,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies[REFRESH_COOKIE_NAME];
      if (token && req.user) {
        await AuthService.revokeRefreshToken(req.user.userId, token);
      }

      res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      }
      const session = await AuthService.buildAuthSession(req.user.userId);
      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (err) {
      next(err);
    }
  }

  public static async setupTwoFactor(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');

      const secret = generateSecret();
      const otpauth = generateURI({ secret, label: req.user.email, issuer: 'EnterpriseERP' });

      // Save secret temporarily
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { twoFactorSecret: secret },
      });

      res.status(200).json({
        success: true,
        data: { secret, otpauth },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async verifyTwoFactor(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
      const { token } = verifyTwoFactorSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
      if (!user || !user.twoFactorSecret) {
        throw new AppError(400, 'NO_2FA_SECRET', 'Two-factor setup has not been initiated');
      }

      const check = verifySync({ token, secret: user.twoFactorSecret });
      if (!check.valid) {
        throw new AppError(400, 'INVALID_OTP', 'Invalid verification code');
      }

      await prisma.user.update({
        where: { id: req.user.userId },
        data: { twoFactorEnabled: true },
      });

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication successfully enabled',
      });
    } catch (err) {
      next(err);
    }
  }
}
