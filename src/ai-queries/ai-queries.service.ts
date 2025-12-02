import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAIQueryDto } from './dto/create-ai-query.dto';

@Injectable()
export class AiQueriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAIQueryDto) {
    return this.prisma.aIQuery.create({
      data: {
        id: dto.id,
        question: dto.question,
        answer: dto.answer,
        answerSummary: dto.answerSummary,
        sources: dto.sources ? JSON.parse(JSON.stringify(dto.sources)) : null,
        userId: dto.userId,
        userName: dto.userName,
        plantId: dto.plantId,
        processId: dto.processId,
        subprocessId: dto.subprocessId,
        machineId: dto.machineId,
        contextPath: dto.contextPath,
      },
    });
  }

  async findAll() {
    return this.prisma.aIQuery.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findRecent(limit = 50) {
    return this.prisma.aIQuery.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async findOne(id: string) {
    return this.prisma.aIQuery.findUnique({
      where: { id },
    });
  }

  async delete(id: string) {
    return this.prisma.aIQuery.delete({
      where: { id },
    });
  }
}
