import { Router } from 'express';
import { CreateTransactionInput, CreateGoalInput, UpdateGoalInput, PaginationSchema } from '@peerlift/shared';
import { financialService } from '@/services/FinancialService';
import { aiService } from '@/services/AIService';
import { asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware, AuthRequest } from '@/middleware/auth';

const router = Router();
router.use(authMiddleware);

// ===== TRANSACTION ROUTES =====

/**
 * @route   POST /api/financial/transactions
 * @desc    Create a new transaction
 * @access  Private
 */
router.post(
  '/transactions',
  asyncHandler(async (req: AuthRequest, res) => {
    const input = req.body as CreateTransactionInput;
    const transaction = await financialService.createTransaction(req.user!.userId, input);

    res.status(201).json({
      success: true,
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/financial/transactions
 * @desc    Get user's transactions
 * @access  Private
 */
router.get(
  '/transactions',
  asyncHandler(async (req: AuthRequest, res) => {
    const pagination = PaginationSchema.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20,
    });

    const result = await financialService.getTransactions(req.user!.userId, pagination);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/financial/transactions/:id
 * @desc    Get a specific transaction
 * @access  Private
 */
router.get(
  '/transactions/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const transaction = await financialService.getTransaction(req.user!.userId, req.params.id);

    res.status(200).json({
      success: true,
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   PUT /api/financial/transactions/:id
 * @desc    Update a transaction
 * @access  Private
 */
router.put(
  '/transactions/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = req.body as Partial<CreateTransactionInput>;
    const transaction = await financialService.updateTransaction(
      req.user!.userId,
      req.params.id,
      data
    );

    res.status(200).json({
      success: true,
      data: transaction,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   DELETE /api/financial/transactions/:id
 * @desc    Delete a transaction
 * @access  Private
 */
router.delete(
  '/transactions/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await financialService.deleteTransaction(req.user!.userId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/financial/summary
 * @desc    Get financial summary
 * @access  Private
 */
router.get(
  '/summary',
  asyncHandler(async (req: AuthRequest, res) => {
    const summary = await financialService.getFinancialSummary(req.user!.userId);

    res.status(200).json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString(),
    });
  })
);

// ===== SAVINGS GOAL ROUTES =====

/**
 * @route   POST /api/financial/goals
 * @desc    Create a savings goal
 * @access  Private
 */
router.post(
  '/goals',
  asyncHandler(async (req: AuthRequest, res) => {
    const input = req.body as CreateGoalInput;
    const goal = await financialService.createGoal(req.user!.userId, input);

    res.status(201).json({
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/financial/goals
 * @desc    Get all savings goals
 * @access  Private
 */
router.get(
  '/goals',
  asyncHandler(async (req: AuthRequest, res) => {
    const goals = await financialService.getGoals(req.user!.userId);

    res.status(200).json({
      success: true,
      data: goals,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/financial/goals/:id
 * @desc    Get a specific goal
 * @access  Private
 */
router.get(
  '/goals/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const goal = await financialService.getGoal(req.user!.userId, req.params.id);

    res.status(200).json({
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   PUT /api/financial/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.put(
  '/goals/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const data = req.body as UpdateGoalInput;
    const goal = await financialService.updateGoal(req.user!.userId, req.params.id, data);

    res.status(200).json({
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   DELETE /api/financial/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete(
  '/goals/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    await financialService.deleteGoal(req.user!.userId, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully',
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   POST /api/financial/goals/:id/contribute
 * @desc    Add amount to savings goal
 * @access  Private
 */
router.post(
  '/goals/:id/contribute',
  asyncHandler(async (req: AuthRequest, res) => {
    const { amount } = req.body as { amount: number };
    const goal = await financialService.addToGoal(req.user!.userId, req.params.id, amount);

    res.status(200).json({
      success: true,
      data: goal,
      timestamp: new Date().toISOString(),
    });
  })
);

// ===== AI INSIGHTS ROUTES =====

/**
 * @route   POST /api/financial/insights
 * @desc    Generate financial insights using AI
 * @access  Private
 */
router.post(
  '/insights',
  asyncHandler(async (req: AuthRequest, res) => {
    const insight = await aiService.generateFinancialInsights(req.user!.userId);

    res.status(201).json({
      success: true,
      data: insight,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/financial/insights
 * @desc    Get recent financial insights
 * @access  Private
 */
router.get(
  '/insights',
  asyncHandler(async (req: AuthRequest, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 50);
    const insights = await aiService.getRecentInsights(req.user!.userId, limit);

    res.status(200).json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
