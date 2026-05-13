import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import { RiskLevel } from '@peerlift/shared';
import { logger } from '@/utils/logger';
import { env } from '@/config/env';

const groq = new Groq({ apiKey: env.GROQ_API_KEY });

export class AIService {
  async generateFinancialInsights(userId: string): Promise<{
    insight: string;
    riskLevel: RiskLevel;
  }> {
    try {
      // Get user's recent transactions and goals
      const [transactions, goals] = await Promise.all([
        prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 30,
        }),
        prisma.savingsGoal.findMany({
          where: { userId },
        }),
      ]);

      // Prepare context for AI
      const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
      const avgMonthly = totalSpending / (transactions.length || 1);
      const categories = [...new Set(transactions.map((t) => t.category))].slice(0, 5);
      const topCategory = transactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const prompt = `You are a financial advisor AI. Analyze this user's financial data and provide ONE specific, actionable insight.

User Financial Data:
- Total transactions analyzed: ${transactions.length}
- Total spending: $${totalSpending.toFixed(2)}
- Average monthly spending: $${avgMonthly.toFixed(2)}
- Top spending categories: ${categories.join(', ')}
- Active savings goals: ${goals.length}
- Completed goals: ${goals.filter((g) => g.completed).length}

Based on this data, provide:
1. ONE specific insight about their financial behavior (1-2 sentences)
2. A risk level assessment: respond with ONLY one of these: "LOW", "MEDIUM", or "HIGH"

Format your response as JSON:
{
  "insight": "Your insight here",
  "riskLevel": "LOW|MEDIUM|HIGH"
}`;

      const message = await groq.messages.create({
        model: 'mixtral-8x7b-32768',
        max_tokens: 256,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Parse response
      const content =
        message.content[0].type === 'text' ? message.content[0].text : '';
      let parsed = { insight: 'Analysis complete', riskLevel: 'MEDIUM' as RiskLevel };

      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        logger.warn('Failed to parse AI response', { error: parseError });
      }

      // Store insight in database
      const insight = await prisma.financialInsight.create({
        data: {
          userId,
          insight: parsed.insight,
          riskLevel: parsed.riskLevel || 'MEDIUM',
          aiModel: 'mixtral-8x7b-32768',
          metadata: JSON.stringify({
            transactionCount: transactions.length,
            avgMonthly,
          }),
        },
      });

      logger.info('Financial insight generated', {
        userId,
        riskLevel: parsed.riskLevel,
      });

      return {
        insight: parsed.insight,
        riskLevel: parsed.riskLevel,
      };
    } catch (error) {
      logger.error('Error generating financial insights', {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });

      // Fallback to rule-based insight
      return this.generateFallbackInsight(userId);
    }
  }

  private async generateFallbackInsight(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30,
    });

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);
    const avgMonthly = totalSpending / (transactions.length || 1);

    let insight = 'Keep tracking your spending consistently.';
    let riskLevel: RiskLevel = 'MEDIUM';

    if (avgMonthly < 500) {
      insight = 'Your spending is well-controlled. Consider setting new savings goals.';
      riskLevel = 'LOW';
    } else if (avgMonthly > 1500) {
      insight = 'Your monthly spending is elevated. Review your budget and cut non-essential expenses.';
      riskLevel = 'HIGH';
    }

    const savedInsight = await prisma.financialInsight.create({
      data: {
        userId,
        insight,
        riskLevel,
        aiModel: 'fallback-rule-based',
        metadata: JSON.stringify({ avgMonthly }),
      },
    });

    return {
      insight: savedInsight.insight,
      riskLevel: savedInsight.riskLevel,
    };
  }

  async getRecentInsights(userId: string, limit: number = 5) {
    return prisma.financialInsight.findMany({
      where: { userId },
      orderBy: { generatedAt: 'desc' },
      take: limit,
    });
  }
}

export const aiService = new AIService();
