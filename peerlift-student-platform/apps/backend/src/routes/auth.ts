import { Router } from 'express';
import { RegisterSchema, LoginSchema, RefreshTokenSchema, UpdateProfileSchema } from '@peerlift/shared';
import { authService } from '@/services/AuthService';
import { asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware, AuthRequest } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const input = RegisterSchema.parse(req.body);
    const result = await authService.register(input);

    logger.info('User registration endpoint', { email: input.email });

    res.status(201).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const input = LoginSchema.parse(req.body);
    const result = await authService.login(input);

    logger.info('User login endpoint', { email: input.email });

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh',
  asyncHandler(async (req, res) => {
    const input = RefreshTokenSchema.parse(req.body);
    const result = await authService.refreshToken(input.refreshToken);

    res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const user = await authService.getUserProfile(req.user!.userId);

    res.status(200).json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    const input = UpdateProfileSchema.parse(req.body);
    const user = await authService.updateProfile(req.user!.userId, input);

    res.status(200).json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client-side token deletion)
 * @access  Private
 */
router.post(
  '/logout',
  authMiddleware,
  asyncHandler(async (req: AuthRequest, res) => {
    logger.info('User logout', { userId: req.user!.userId });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
