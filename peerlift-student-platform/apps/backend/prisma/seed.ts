import { PrismaClient, UserRole, OrganizationType, DifficultyLevel, RiskLevel } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await prisma.mentorshipSession.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.learningModule.deleteMany();
  await prisma.financialInsight.deleteMany();
  await prisma.savingsGoal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();
  await prisma.organization.deleteMany();

  // Create organizations
  console.log('Creating organizations...');
  const ngo = await prisma.organization.create({
    data: {
      name: 'Financial Empowerment Foundation',
      type: OrganizationType.NGO,
    },
  });

  const school = await prisma.organization.create({
    data: {
      name: 'Lincoln High School',
      type: OrganizationType.SCHOOL,
    },
  });

  // Create schools
  console.log('Creating schools...');
  const schoolData = await prisma.school.create({
    data: {
      organizationId: school.id,
      name: 'Lincoln High School - Main Campus',
      district: 'Metropolitan District',
      state: 'California',
    },
  });

  // Create admin user
  console.log('Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@peerlift.com',
      passwordHash: await hash('AdminPassword123!', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      organizationId: ngo.id,
      emailVerified: true,
    },
  });

  // Create NGO coordinator
  const coordinator = await prisma.user.create({
    data: {
      email: 'coordinator@peerlift.com',
      passwordHash: await hash('CoordinatorPass123!', 10),
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.NGO_COORDINATOR,
      organizationId: ngo.id,
      emailVerified: true,
    },
  });

  // Create teacher
  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@peerlift.com',
      passwordHash: await hash('TeacherPass123!', 10),
      firstName: 'Michael',
      lastName: 'Smith',
      role: UserRole.TEACHER,
      organizationId: school.id,
      schoolId: schoolData.id,
      emailVerified: true,
    },
  });

  // Create mentors
  console.log('Creating mentor users...');
  const mentor1 = await prisma.user.create({
    data: {
      email: 'mentor1@peerlift.com',
      passwordHash: await hash('MentorPass123!', 10),
      firstName: 'James',
      lastName: 'Wilson',
      role: UserRole.MENTOR,
      organizationId: school.id,
      schoolId: schoolData.id,
      emailVerified: true,
    },
  });

  const mentor2 = await prisma.user.create({
    data: {
      email: 'mentor2@peerlift.com',
      passwordHash: await hash('MentorPass123!', 10),
      firstName: 'Emily',
      lastName: 'Davis',
      role: UserRole.MENTOR,
      organizationId: school.id,
      schoolId: schoolData.id,
      emailVerified: true,
    },
  });

  // Create students
  console.log('Creating student users...');
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.create({
      data: {
        email: `student${i}@peerlift.com`,
        passwordHash: await hash('StudentPass123!', 10),
        firstName: `Student`,
        lastName: `${i}`,
        role: UserRole.STUDENT,
        organizationId: school.id,
        schoolId: schoolData.id,
        emailVerified: true,
      },
    });
    students.push(student);
  }

  // Create transactions for students
  console.log('Creating transactions...');
  const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Bills & Utilities'];
  for (const student of students) {
    for (let i = 0; i < 8; i++) {
      await prisma.transaction.create({
        data: {
          userId: student.id,
          amount: Math.random() * 100 + 10,
          category: categories[Math.floor(Math.random() * categories.length)],
          description: `Sample transaction ${i + 1}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Create savings goals
  console.log('Creating savings goals...');
  for (const student of students) {
    await prisma.savingsGoal.create({
      data: {
        userId: student.id,
        goalName: 'Emergency Fund',
        targetAmount: 1000,
        currentAmount: Math.random() * 500,
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.savingsGoal.create({
      data: {
        userId: student.id,
        goalName: 'College Fund',
        targetAmount: 5000,
        currentAmount: Math.random() * 2000,
        deadline: new Date(Date.now() + 4 * 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create learning modules
  console.log('Creating learning modules...');
  const modules = [
    {
      title: 'Introduction to Personal Finance',
      description: 'Learn the basics of managing your money',
      content: 'Personal finance is the management of money and investments...',
      difficulty: DifficultyLevel.BEGINNER,
      estimatedTime: 30,
    },
    {
      title: 'Creating a Budget',
      description: 'Master the art of budgeting',
      content: 'A budget is a plan for your money...',
      difficulty: DifficultyLevel.BEGINNER,
      estimatedTime: 45,
    },
    {
      title: 'Understanding Credit Scores',
      description: 'Learn how credit scores work',
      content: 'Your credit score is a number that represents your creditworthiness...',
      difficulty: DifficultyLevel.INTERMEDIATE,
      estimatedTime: 60,
    },
    {
      title: 'Investment Fundamentals',
      description: 'Start your investing journey',
      content: 'Investing is putting your money into assets...',
      difficulty: DifficultyLevel.INTERMEDIATE,
      estimatedTime: 75,
    },
    {
      title: 'Advanced Tax Planning',
      description: 'Optimize your taxes',
      content: 'Tax planning is the process of minimizing your tax liability...',
      difficulty: DifficultyLevel.ADVANCED,
      estimatedTime: 90,
    },
  ];

  const createdModules = [];
  for (const module of modules) {
    const created = await prisma.learningModule.create({
      data: module,
    });
    createdModules.push(created);
  }

  // Create user progress
  console.log('Creating user progress...');
  for (const student of students) {
    for (let i = 0; i < 3; i++) {
      await prisma.userProgress.create({
        data: {
          userId: student.id,
          moduleId: createdModules[i].id,
          completed: true,
          score: Math.floor(Math.random() * 40 + 60),
          completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Create financial insights
  console.log('Creating financial insights...');
  const insights = [
    'Your spending on entertainment has increased by 25% this month',
    'You are on track to meet your savings goal',
    'Consider reducing dining expenses to save more',
    'Your financial stability is excellent',
    'You have potential for improved savings',
  ];

  for (const student of students) {
    for (let i = 0; i < 2; i++) {
      await prisma.financialInsight.create({
        data: {
          userId: student.id,
          insight: insights[Math.floor(Math.random() * insights.length)],
          riskLevel: [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH][Math.floor(Math.random() * 3)],
          aiModel: 'llama-2-70b',
        },
      });
    }
  }

  // Create mentorship sessions
  console.log('Creating mentorship sessions...');
  for (let i = 0; i < students.length; i++) {
    await prisma.mentorshipSession.create({
      data: {
        mentorId: i % 2 === 0 ? mentor1.id : mentor2.id,
        studentId: students[i].id,
        topic: 'Financial Goal Setting',
        notes: 'Discussed short-term and long-term financial goals',
        sessionDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Database seed completed successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin: admin@peerlift.com / AdminPassword123!');
  console.log('Coordinator: coordinator@peerlift.com / CoordinatorPass123!');
  console.log('Teacher: teacher@peerlift.com / TeacherPass123!');
  console.log('Mentor: mentor1@peerlift.com / MentorPass123!');
  console.log('Student: student1@peerlift.com / StudentPass123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
