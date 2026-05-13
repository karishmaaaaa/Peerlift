import { Router } from 'express';
import { CreateLearningModuleInput, PaginationSchema } from '@peerlift/shared';
import { learningService } from '@/services/LearningService';
import { asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware, requireRole, AuthRequest } from '@/middleware/auth';

const router = Router();
router.use(authMiddleware);

// ===== MODULE MANAGEMENT (ADMIN/TEACHER) =====

/**
 * @route   POST /api/learning/modules
 * @desc    Create a new learning module
 * @access  Private (ADMIN, TEACHER)
 */
router.post(
  '/modules',
  requireRole('ADMIN', 'TEACHER'),
  asyncHandler(async (req: AuthRequest, res) => {
    const input = req.body as CreateLearningModuleInput;
    const module = await learningService.createModule(input);

    res.status(201).json({
      success: true,
      data: module,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/learning/modules
 * @desc    Get all learning modules
 * @access  Private
 */
router.get(
  '/modules',
  asyncHandler(async (req: AuthRequest, res) => {
    const pagination = PaginationSchema.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20,
    });

    const result = await learningService.getModules(pagination);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/learning/modules/:id
 * @desc    Get a specific module
 * @access  Private
 */
router.get(
  '/modules/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const module = await learningService.getModule(req.params.id);

    res.status(200).json({
      success: true,
      data: module,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   PUT /api/learning/modules/:id
 * @desc    Update a module
 * @access  Private (ADMIN, TEACHER)
 */
router.put(
  '/modules/:id',
  requireRole('ADMIN', 'TEACHER'),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = req.body as Partial<CreateLearningModuleInput>;
    const module = await learningService.updateModule(req.params.id, data);

    res.status(200).json({
      success: true,
      data: module,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   DELETE /api/learning/modules/:id
 * @desc    Delete a module
 * @access  Private (ADMIN, TEACHER)
 */
router.delete(
  '/modules/:id',
  requireRole('ADMIN', 'TEACHER'),
  asyncHandler(async (req: AuthRequest, res) => {
    await learningService.deleteModule(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Module deleted successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

// ===== USER PROGRESS TRACKING =====

/**
 * @route   POST /api/learning/progress/:moduleId/start
 * @desc    Start a learning module
 * @access  Private
 */
router.post(
  '/progress/:moduleId/start',
  asyncHandler(async (req: AuthRequest, res) => {
    const progress = await learningService.startModule(req.user!.userId, req.params.moduleId);

    res.status(201).json({
      success: true,
      data: progress,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   POST /api/learning/progress/:moduleId/complete
 * @desc    Complete a learning module
 * @access  Private
 */
router.post(
  '/progress/:moduleId/complete',
  asyncHandler(async (req: AuthRequest, res) => {
    const { score } = req.body as { score?: number };
    const progress = await learningService.completeModule(
      req.user!.userId,
      req.params.moduleId,
      score
    );

    res.status(200).json({
      success: true,
      data: progress,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/learning/progress/:moduleId
 * @desc    Get user progress for a module
 * @access  Private
 */
router.get(
  '/progress/:moduleId',
  asyncHandler(async (req: AuthRequest, res) => {
    const progress = await learningService.getUserProgress(req.user!.userId, req.params.moduleId);

    res.status(200).json({
      success: true,
      data: progress,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/learning/progress
 * @desc    Get all user progress
 * @access  Private
 */
router.get(
  '/progress',
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await learningService.getUserModuleProgress(req.user!.userId);

    res.status(200).json({
      success: true,
      data: result.data,
      summary: result.summary,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/learning/leaderboard
 * @desc    Get leaderboard of students
 * @access  Private
 */
router.get(
  '/leaderboard',
  asyncHandler(async (req: AuthRequest, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const leaderboard = await learningService.getLeaderboard(limit);

    res.status(200).json({
      success: true,
      data: leaderboard,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
