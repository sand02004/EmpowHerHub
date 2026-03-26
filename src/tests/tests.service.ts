import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestDto, SubmitTestDto } from './dto/create-test.dto';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.test.findMany({
      include: {
        questions: {
          include: {
            answerOptions: { select: { id: true, content: true } } // Obfuscate `isCorrect`
          }
        }
      }
    });
  }

  async findOne(id: string) {
    const test = await this.prisma.client.test.findUnique({
      where: { id },
      include: {
        questions: {
          include: { answerOptions: { select: { id: true, content: true } } }
        }
      }
    });
    if (!test) throw new NotFoundException('Test not found');
    return test;
  }

  async create(createTestDto: CreateTestDto) {
    return this.prisma.client.test.create({
      data: {
        title: createTestDto.title,
        description: createTestDto.description,
        passingScore: createTestDto.passingScore,
        questions: {
          create: createTestDto.questions.map(q => ({
            content: q.content,
            answerOptions: {
              create: q.answerOptions.map(a => ({
                content: a.content,
                isCorrect: a.isCorrect
              }))
            }
          }))
        }
      },
      include: { questions: { include: { answerOptions: true } } }
    });
  }

  async submitTest(userId: string, testId: string, submitDto: SubmitTestDto) {
    const test = await this.prisma.client.test.findUnique({
      where: { id: testId },
      include: { questions: { include: { answerOptions: true } } }
    });

    if (!test) throw new NotFoundException('Test not found');

    let correctAnswersCount = 0;
    const totalQuestions = test.questions.length;

    if (totalQuestions === 0) throw new BadRequestException('Test has no questions');

    submitDto.answers.forEach(submitAnswer => {
      const question = test.questions.find(q => q.id === submitAnswer.questionId);
      if (question) {
        const option = question.answerOptions.find(o => o.id === submitAnswer.answerOptionId);
        if (option && option.isCorrect) {
          correctAnswersCount++;
        }
      }
    });

    const score = (correctAnswersCount / totalQuestions) * 100;
    const passed = score >= test.passingScore;

    const userTest = await this.prisma.client.userTest.create({
      data: {
        userId,
        testId,
        score,
        passed,
        completedAt: new Date(),
        answers: {
          create: submitDto.answers.map(a => ({
            questionId: a.questionId,
            answerOptionId: a.answerOptionId
          }))
        }
      }
    });
    
    return { score, passed, userTest };
  }
}
