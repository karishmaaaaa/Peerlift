import { prisma } from '@/lib/prisma';
import { CreateMentorshipSessionInput, UpdateMentorshipSessionInput, PaginationInput } from '@peerlift/shared';
import { NotFoundError, AuthorizationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class MentorshipService {
  async createSession(mentorId: string, input: CreateMentorshipSessionInput) {
    // Verify mentor exists and is a mentor
    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
    });

    if (!mentor || mentor.role !== 'MENTOR') {
      throw new NotFoundError('Mentor not found');
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: input.studentId },
    });

    if (!student || student.role !== 'STUDENT') {
      throw new NotFoundError('Student not found');
    }

    const session = await prisma.mentorshipSession.create({
      data: {
        mentorId,
        studentId: input.studentId,
        topic: input.topic,
        notes: input.notes,
        sessionDate: new Date(input.sessionDate),
      },
    });

    logger.info('Mentorship session created', {
      mentorId,
      studentId: input.studentId,
      sessionId: session.id,
    });

    return session;
  }

  async getSessionsAsMentor(mentorId: string, pagination: PaginationInput) {
    const { page, pageSize } = pagination;

    const [sessions, total] = await Promise.all([
      prisma.mentorshipSession.findMany({
        where: { mentorId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.mentorshipSession.count({ where: { mentorId } }),
    ]);

    return {
      data: sessions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getSessionsAsStudent(studentId: string, pagination: PaginationInput) {
    const { page, pageSize } = pagination;

    const [sessions, total] = await Promise.all([
      prisma.mentorshipSession.findMany({
        where: { studentId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          mentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.mentorshipSession.count({ where: { studentId } }),
    ]);

    return {
      data: sessions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getSession(sessionId: string) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundError('Session not found');
    }

    return session;
  }

  async updateSession(mentorId: string, sessionId: string, data: UpdateMentorshipSessionInput) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.mentorId !== mentorId) {
      throw new AuthorizationError('You cannot update this session');
    }

    const updated = await prisma.mentorshipSession.update({
      where: { id: sessionId },
      data,
    });

    logger.info('Mentorship session updated', { sessionId, mentorId });
    return updated;
  }

  async cancelSession(mentorId: string, sessionId: string) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.mentorId !== mentorId) {
      throw new AuthorizationError('You cannot cancel this session');
    }

    const updated = await prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: { status: 'CANCELLED' },
    });

    logger.info('Mentorship session cancelled', { sessionId, mentorId });
    return updated;
  }

  async completeSession(mentorId: string, sessionId: string, feedback?: string) {
    const session = await prisma.mentorshipSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.mentorId !== mentorId) {
      throw new AuthorizationError('You cannot complete this session');
    }

    const updated = await prisma.mentorshipSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        feedback,
      },
    });

    logger.info('Mentorship session completed', { sessionId, mentorId });
    return updated;
  }

  async getMentorStats(mentorId: string) {
    const sessions = await prisma.mentorshipSession.findMany({
      where: { mentorId },
    });

    const completed = sessions.filter((s) => s.status === 'COMPLETED').length;
    const scheduled = sessions.filter((s) => s.status === 'SCHEDULED').length;
    const cancelled = sessions.filter((s) => s.status === 'CANCELLED').length;
    const uniqueStudents = new Set(sessions.map((s) => s.studentId)).size;

    return {
      totalSessions: sessions.length,
      completed,
      scheduled,
      cancelled,
      uniqueStudents,
    };
  }

  async getStudentMentors(studentId: string) {
    const sessions = await prisma.mentorshipSession.findMany({
      where: { studentId },
      include: {
        mentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          },
        },
      },
      distinct: ['mentorId'],
    });

    return sessions.map((s) => s.mentor);
  }
}

export const mentorshipService = new MentorshipService();
