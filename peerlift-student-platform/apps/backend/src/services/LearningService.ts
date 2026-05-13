import { prisma } from '@/lib/prisma';
import { CreateLearningModuleInput, PaginationInput } from '@peerlift/shared';
import { NotFoundError, AuthorizationError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { UserRole } from '@peerlift/shared';

export class LearningService {
  // Module management (admin/teachers only)
  async createModule(input: CreateLearningModuleInput) {
    const module = await prisma.learningModule.create({
      data: input,
    });

    logger.info('Learning module created', { moduleId: module.id });
    return module;
  }

  async getModules(pagination: PaginationInput) {
    const { page, pageSize } = pagination;

    const [modules, total] = await Promise.all([
      prisma.learningModule.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.learningModule.count(),
    ]);

    return {
      data: modules,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getModule(moduleId: string) {
    const module = await prisma.learningModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new NotFoundError('Module not found');
    }

    return module;
  }

  async updateModule(moduleId: string, data: Partial<CreateLearningModuleInput>) {
    const module = await prisma.learningModule.update({
      where: { id: moduleId },
      data,
    });

    logger.info('Learning module updated', { moduleId });
    return module;
  }

  async deleteModule(moduleId: string) {
    await prisma.learningModule.delete({
      where: { id: moduleId },
    });

    logger.info('Learning module deleted', { moduleId });
  }

  // User progress tracking
  async startModule(userId: string, moduleId: string) {
    // Check if module exists
    await this.getModule(moduleId);

    // Create or update progress
    const progress = await prisma.userProgress.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      update: {},
      create: {
        userId,
        moduleId,
        completed: false,
      },
    });

    logger.info('User started module', { userId, moduleId });
    return progress;
  }

  async completeModule(userId: string, moduleId: string, score?: number) {
    // Verify user has access to progress
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
    });

    if (!progress) {
      throw new NotFoundError('Progress not found');
    }

    const updated = await prisma.userProgress.update({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      data: {
        completed: true,
        score,
        completedAt: new Date(),
      },
      include: {
        module: true,
      },
    });

    logger.info('User completed module', { userId, moduleId, score });
    return updated;
  }

  async getUserProgress(userId: string, moduleId: string) {
    const progress = await prisma.userProgress.findUnique({
      where: {
        userId_moduleId: {
          userId,
          moduleId,
        },
      },
      include: {
        module: true,
      },
    });

    return progress;
  }

  async getUserModuleProgress(userId: string) {
    const progress = await prisma.userProgress.findMany({
      where: { userId },
      include: {
        module: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const completed = progress.filter((p) => p.completed).length;
    const inProgress = progress.filter((p) => !p.completed).length;
    const avgScore =
      progress
        .filter((p) => p.score !== null)
        .reduce((sum, p) => sum + (p.score || 0), 0) /
        Math.max(progress.filter((p) => p.score !== null).length, 1) || 0;

    return {
      data: progress,
      summary: {
        totalStarted: progress.length,
        completed,
        inProgress,
        averageScore: Math.round(avgScore),
      },
    };
  }

  async getLeaderboard(limit: number = 10) {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' as any },
      include: {
        progress: {
          where: { completed: true },
        },
      },
      orderBy: {
        progress: {
          _count: 'desc',
        },
      },
      take: limit,
    });

    return students.map((student, index) => ({
      rank: index + 1,
      userId: student.id,
      name: `${student.firstName} ${student.lastName}`,
      completedModules: student.progress.length,
      averageScore:
        student.progress.reduce((sum, p) => sum + (p.score || 0), 0) /
        Math.max(student.progress.length, 1) || 0,
    }));
  }
}

export const learningService = new LearningService();
