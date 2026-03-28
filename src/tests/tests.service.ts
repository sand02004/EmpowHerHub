import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestDto, SubmitTestDto } from './dto/create-test.dto';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const tests: any[] = await this.prisma.client.$queryRaw`
      SELECT t.*, json_agg(
        json_build_object('id', q.id, 'content', q.content, 'answerOptions',
          (SELECT json_agg(json_build_object('id', a.id, 'content', a.content))
           FROM "AnswerOption" a WHERE a."questionId" = q.id))
      ) as questions
      FROM "Test" t
      LEFT JOIN "Question" q ON q."testId" = t.id
      GROUP BY t.id
      ORDER BY t."createdAt" DESC
    `;
    return tests;
  }

  async findOne(id: string) {
    const tests: any[] = await this.prisma.client.$queryRaw`
      SELECT t.*, json_agg(
        json_build_object('id', q.id, 'content', q.content, 'answerOptions',
          (SELECT json_agg(json_build_object('id', a.id, 'content', a.content))
           FROM "AnswerOption" a WHERE a."questionId" = q.id))
      ) as questions
      FROM "Test" t
      LEFT JOIN "Question" q ON q."testId" = t.id
      WHERE t.id = ${id}
      GROUP BY t.id
    `;
    if (!tests.length) throw new NotFoundException('Test not found');
    return tests[0];
  }

  async create(createTestDto: CreateTestDto) {
    const testId = crypto.randomUUID();
    await this.prisma.client.$executeRaw`
      INSERT INTO "Test" (id, title, description, "passingScore", "createdAt", "updatedAt")
      VALUES (${testId}, ${createTestDto.title}, ${createTestDto.description}, ${createTestDto.passingScore}, NOW(), NOW())
    `;

    for (const q of createTestDto.questions) {
      const questionId = crypto.randomUUID();
      await this.prisma.client.$executeRaw`
        INSERT INTO "Question" (id, "testId", content)
        VALUES (${questionId}, ${testId}, ${q.content})
      `;
      for (const a of q.answerOptions) {
        const answerId = crypto.randomUUID();
        await this.prisma.client.$executeRaw`
          INSERT INTO "AnswerOption" (id, "questionId", content, "isCorrect")
          VALUES (${answerId}, ${questionId}, ${a.content}, ${a.isCorrect})
        `;
      }
    }

    return this.findOne(testId);
  }

  async submitTest(userId: string, testId: string, submitDto: SubmitTestDto) {
    // Get test with correct answers
    const questions: any[] = await this.prisma.client.$queryRaw`
      SELECT q.id as "questionId", a.id as "answerId", a."isCorrect"
      FROM "Question" q
      JOIN "AnswerOption" a ON a."questionId" = q.id
      WHERE q."testId" = ${testId}
    `;
    const tests: any[] = await this.prisma.client.$queryRaw`SELECT * FROM "Test" WHERE id = ${testId}`;
    if (!tests.length) throw new NotFoundException('Test not found');
    const test = tests[0];

    const totalQuestions = new Set(questions.map(q => q.questionId)).size;
    if (totalQuestions === 0) throw new BadRequestException('Test has no questions');

    let correctAnswersCount = 0;
    for (const ans of submitDto.answers) {
      const correctAnswer = questions.find(q => q.questionId === ans.questionId && q.answerId === ans.answerOptionId && q.isCorrect);
      if (correctAnswer) correctAnswersCount++;
    }

    const score = (correctAnswersCount / totalQuestions) * 100;
    const passed = score >= test.passingScore;

    const userTestId = crypto.randomUUID();
    await this.prisma.client.$executeRaw`
      INSERT INTO "UserTest" (id, "userId", "testId", score, passed, "completedAt")
      VALUES (${userTestId}, ${userId}, ${testId}, ${score}, ${passed}, NOW())
    `;

    return { score, passed, userTestId };
  }
}
