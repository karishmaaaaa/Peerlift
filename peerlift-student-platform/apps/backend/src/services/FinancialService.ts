import { prisma } from '@/lib/prisma';
import { CreateTransactionInput, CreateGoalInput, UpdateGoalInput, PaginationInput } from '@peerlift/shared';
import { NotFoundError, AuthorizationError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class FinancialService {
  // Transaction methods
  async createTransaction(userId: string, input: CreateTransactionInput) {
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        ...input,
        date: new Date(input.date),
      },
    });

    logger.info('Transaction created', { userId, transactionId: transaction.id });
    return transaction;
  }

  async getTransactions(userId: string, pagination: PaginationInput) {
    const { page, pageSize } = pagination;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { date: 'desc' },
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    return {
      data: transactions,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getTransaction(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundError('Transaction not found');
    }

    return transaction;
  }

  async updateTransaction(userId: string, transactionId: string, data: Partial<CreateTransactionInput>) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundError('Transaction not found');
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    logger.info('Transaction updated', { userId, transactionId });
    return updated;
  }

  async deleteTransaction(userId: string, transactionId: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.userId !== userId) {
      throw new NotFoundError('Transaction not found');
    }

    await prisma.transaction.delete({ where: { id: transactionId } });

    logger.info('Transaction deleted', { userId, transactionId });
  }

  async getFinancialSummary(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
    });

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    const byCategory = transactions.reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const monthlySpending = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSpending,
      byCategory,
      monthlySpending,
      transactionCount: transactions.length,
    };
  }

  // Savings goal methods
  async createGoal(userId: string, input: CreateGoalInput) {
    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        goalName: input.goalName,
        targetAmount: input.targetAmount,
        deadline: new Date(input.deadline),
      },
    });

    logger.info('Savings goal created', { userId, goalId: goal.id });
    return goal;
  }

  async getGoals(userId: string) {
    return prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
  }

  async getGoal(userId: string, goalId: string) {
    const goal = await prisma.savingsGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.userId !== userId) {
      throw new NotFoundError('Goal not found');
    }

    return goal;
  }

  async updateGoal(userId: string, goalId: string, data: UpdateGoalInput) {
    const goal = await prisma.savingsGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.userId !== userId) {
      throw new NotFoundError('Goal not found');
    }

    const updated = await prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
    });

    logger.info('Savings goal updated', { userId, goalId });
    return updated;
  }

  async deleteGoal(userId: string, goalId: string) {
    const goal = await prisma.savingsGoal.findUnique({
      where: { id: goalId },
    });

    if (!goal || goal.userId !== userId) {
      throw new NotFoundError('Goal not found');
    }

    await prisma.savingsGoal.delete({ where: { id: goalId } });

    logger.info('Savings goal deleted', { userId, goalId });
  }

  async addToGoal(userId: string, goalId: string, amount: number) {
    const goal = await this.getGoal(userId, goalId);

    const updated = await prisma.savingsGoal.update({
      where: { id: goalId },
      data: {
        currentAmount: goal.currentAmount + amount,
        completed: goal.currentAmount + amount >= goal.targetAmount,
      },
    });

    logger.info('Amount added to goal', { userId, goalId, amount });
    return updated;
  }
}

export const financialService = new FinancialService();
