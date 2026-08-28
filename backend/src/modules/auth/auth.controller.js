import { z } from 'zod';
import { AuthService } from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['donor', 'recipient', 'volunteer', 'admin']).default('donor'),
  profileData: z.record(z.any()).optional().default({}),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export class AuthController {
  static async signup(req, res) {
    try {
      const validated = signupSchema.parse(req.body);
      const result = await AuthService.register(validated);
      return sendSuccess(res, result, 'User registered successfully (MongoDB Auth + PostgreSQL Profile)', 201);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, { message: 'Validation Error', details: error.errors }, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  static async login(req, res) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await AuthService.login(validated);
      return sendSuccess(res, result, 'Logged in successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, { message: 'Validation Error', details: error.errors }, 400);
      }
      return sendError(res, error.message, 401);
    }
  }

  static async refreshToken(req, res) {
    try {
      const validated = refreshSchema.parse(req.body);
      const tokens = await AuthService.refresh(validated.refreshToken);
      return sendSuccess(res, tokens, 'Access token refreshed successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, { message: 'Validation Error', details: error.errors }, 400);
      }
      return sendError(res, error.message, 401);
    }
  }

  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.id;
      await AuthService.logout(userId, refreshToken);
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      return sendError(res, error.message, 400);
    }
  }

  static async forgotPassword(req, res) {
    try {
      const validated = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(validated.email);
      return sendSuccess(res, result, 'Password reset token generated');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, { message: 'Validation Error', details: error.errors }, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  static async resetPassword(req, res) {
    try {
      const validated = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(validated.token, validated.newPassword);
      return sendSuccess(res, result, 'Password updated successfully');
    } catch (error) {
      if (error instanceof z.ZodError) {
        return sendError(res, { message: 'Validation Error', details: error.errors }, 400);
      }
      return sendError(res, error.message, 400);
    }
  }

  static async getMe(req, res) {
    try {
      const profile = await AuthService.getMe(req.user.id, req.user.role);
      return sendSuccess(res, {
        user: req.user,
        profile,
      }, 'Authenticated user profile loaded');
    } catch (error) {
      return sendError(res, error.message, 500);
    }
  }
}
