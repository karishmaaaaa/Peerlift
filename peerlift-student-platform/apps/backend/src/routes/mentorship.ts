import { Router } from 'express';
import { CreateMentorshipSessionInput, UpdateMentorshipSessionInput, PaginationSchema } from '@peerlift/shared';
import { mentorshipService } from '@/services/MentorshipService';
import { asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware, requireRole, AuthRequest } from '@/middleware/auth';

const router = Router();
router.use(authMiddleware);

/**
 * @route   POST /api/mentorship/sessions
 * @desc    Create a new mentorship session
 * @access  Private (MENTOR)
 */
router.post(
  '/sessions',
  requireRole('MENTOR'),
  asyncHandler(async (req: AuthRequest, res) => {
    const input = req.body as CreateMentorshipSessionInput;
    const session = await mentorshipService.createSession(req.user!.userId, input);

    res.status(201).json({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/mentorship/sessions/mentor
 * @desc    Get mentorship sessions as mentor
 * @access  Private (MENTOR)
 */
router.get(
  '/sessions/mentor',
  requireRole('MENTOR'),
  asyncHandler(async (req: AuthRequest, res) => {
    const pagination = PaginationSchema.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20,
    });

    const result = await mentorshipService.getSessionsAsMentor(req.user!.userId, pagination);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/mentorship/sessions/student
 * @desc    Get mentorship sessions as student
 * @access  Private (STUDENT)
 */
router.get(
  '/sessions/student',
  requireRole('STUDENT'),
  asyncHandler(async (req: AuthRequest, res) => {
    const pagination = PaginationSchema.parse({
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 20,
    });

    const result = await mentorshipService.getSessionsAsStudent(req.user!.userId, pagination);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/mentorship/sessions/:id
 * @desc    Get a specific session
 * @access  Private
 */
router.get(
  '/sessions/:id',
  asyncHandler(async (req: AuthRequest, res) => {
    const session = await mentorshipService.getSession(req.params.id);

    res.status(200).json({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   PUT /api/mentorship/sessions/:id
 * @desc    Update a session
 * @access  Private (MENTOR)
 */
router.put(
  '/sessions/:id',
  requireRole('MENTOR'),
  asyncHandler(async (req: AuthRequest, res) => {
    const data = req.body as UpdateMentorshipSessionInput;
    const session = await mentorshipService.updateSession(req.user!.userId, req.params.id, data);

    res.status(200).json({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   POST /api/mentorship/sessions/:id/complete
 * @desc    Complete a session
 * @access  Private (MENTOR)
 */
router.post(
  '/sessions/:id/complete',
  requireRole('MENTOR'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { feedback } = req.body as { feedback?: string };
    const session = await mentorshipService.completeSession(
      req.user!.userId,
      req.params.id,
      feedback
    );

    res.status(200).json({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   POST /api/mentorship/sessions/:id/cancel
 * @desc    Cancel a session
 * @access  Private (MENTOR)
 */
router.post(
  '/sessions/:id/cancel',
  requireRole('MENTOR'),
  asyncHandler(async (req: AuthRequest, res) => {
    const session = await mentorshipService.cancelSession(req.user!.userId, req.params.id);

    res.status(200).json({
      success: true,
      data: session,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/mentorship/stats
 * @desc    Get mentor statistics
 * @access  Private (MENTOR)
 */
router.get(
  '/stats',
  requireRole('MENTOR'),
  asyncHandler(async (req: AuthRequest, res) => {
    const stats = await mentorshipService.getMentorStats(req.user!.userId);

    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  })
);

/**
 * @route   GET /api/mentorship/my-mentors
 * @desc    Get student's mentors
 * @access  Private (STUDENT)
 */
router.get(
  '/my-mentors',
  requireRole('STUDENT'),
  asyncHandler(async (req: AuthRequest, res) => {
    const mentors = await mentorshipService.getStudentMentors(req.user!.userId);

    res.status(200).json({
      success: true,
      data: mentors,
      timestamp: new Date().toISOString(),
    });
  })
);

export default router;
