import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateWorkOrdersDto,
  TechnicalReportDto,
  WorkOrderAiDataDto,
} from './dto/create-workOrders.dto';
import { UpdateWorkOrdersDto } from './dto/update-workOrders.dto';

const workOrderIncludes: Prisma.WorkOrderInclude = {
  aiData: true,
  technicalReport: true,
  logs: {
    orderBy: { date: 'asc' },
  },
  plant: true,
  process: true,
  subprocess: true,
  machine: {
    include: {
      documents: true,
    },
  },
};

@Injectable()
export class WorkOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private normalizeId(value?: string | null) {
    if (!value) return null;
    const trimmed = value.toString().trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  async create(dto: CreateWorkOrdersDto) {
    const { aiData, technicalReport, logs, plantId, processId, subprocessId, machineId, ...rest } =
      dto;

    return this.prisma.workOrder.create({
      data: {
        ...rest,
        plantId: this.normalizeId(plantId),
        processId: this.normalizeId(processId),
        subprocessId: this.normalizeId(subprocessId),
        machineId: this.normalizeId(machineId),
        symptoms: dto.symptoms ?? [],
        assignedTo: dto.assignedTo ?? null,
        reportDate: this.toDate(dto.reportDate) ?? new Date(),
        slaTarget: this.toDate(dto.slaTarget) ?? new Date(),
        startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
        closedAt: dto.closedAt ? new Date(dto.closedAt) : null,
        aiData: aiData
          ? {
              create: this.mapAiData(aiData),
            }
          : undefined,
        technicalReport: technicalReport
          ? {
              create: this.mapTechnicalReport(technicalReport),
            }
          : undefined,
        logs: logs?.length
          ? {
              create: logs.map((log) => ({
                date: new Date(log.date),
                action: log.action,
                user: log.user,
                comment: log.comment ?? null,
              })),
            }
          : undefined,
      },
      include: workOrderIncludes,
    });
  }

  async findAll() {
    return this.prisma.workOrder.findMany({
      include: workOrderIncludes,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const workOrder = await this.prisma.workOrder.findUnique({
      where: { id },
      include: workOrderIncludes,
    });

    if (!workOrder) {
      throw new NotFoundException('Work order not found');
    }

    return workOrder;
  }

  async update(id: string, dto: UpdateWorkOrdersDto) {
    await this.ensureExists(id);

    const { aiData, technicalReport, logs, plantId, processId, subprocessId, machineId, ...rest } =
      dto;

    return this.prisma.workOrder.update({
      where: { id },
      data: {
        ...rest,
        plantId: plantId !== undefined ? this.normalizeId(plantId) ?? undefined : undefined,
        processId: processId !== undefined ? this.normalizeId(processId) ?? undefined : undefined,
        subprocessId:
          subprocessId !== undefined ? this.normalizeId(subprocessId) ?? undefined : undefined,
        machineId: machineId !== undefined ? this.normalizeId(machineId) ?? undefined : undefined,
        symptoms: dto.symptoms ?? undefined,
        assignedTo: dto.assignedTo ?? undefined,
        reportDate: dto.reportDate ? new Date(dto.reportDate) : undefined,
        slaTarget: dto.slaTarget ? new Date(dto.slaTarget) : undefined,
        startedAt: dto.startedAt === null ? null : dto.startedAt ? new Date(dto.startedAt) : undefined,
        closedAt: dto.closedAt === null ? null : dto.closedAt ? new Date(dto.closedAt) : undefined,
        aiData: aiData
          ? {
              upsert: {
                create: this.mapAiData(aiData),
                update: this.mapAiData(aiData),
              },
            }
          : undefined,
        technicalReport: technicalReport
          ? {
              upsert: {
                create: this.mapTechnicalReport(technicalReport),
                update: this.mapTechnicalReport(technicalReport),
              },
            }
          : undefined,
        ...(logs?.length
          ? {
              logs: {
                create: logs.map((log) => ({
                  date: new Date(log.date),
                  action: log.action,
                  user: log.user,
                  comment: log.comment ?? null,
                })),
              },
            }
          : {}),
      },
      include: workOrderIncludes,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.workOrder.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const exists = await this.prisma.workOrder.count({ where: { id } });
    if (!exists) {
      throw new NotFoundException('Work order not found');
    }
  }

  private toDate(value?: string | Date | null) {
    if (!value) return undefined;
    return value instanceof Date ? value : new Date(value);
  }

  private mapAiData(data: WorkOrderAiDataDto) {
    return {
      classification: data.classification,
      priority: data.priority,
      riskLevel: data.riskLevel,
      productionImpact: data.productionImpact ?? 'No especificado',
      qualityImpact: data.qualityImpact ?? false,
      operatorInstructions: data.operatorInstructions ?? '',
      rootCauses: data.rootCauses ?? [],
      suggestedActions: data.suggestedActions ?? [],
    };
  }

  private mapTechnicalReport(data: TechnicalReportDto) {
    return {
      inspections: data.inspections ?? null,
      measurements: data.measurements ?? null,
      diagnosis: data.diagnosis ?? null,
      aiMatch: data.aiMatch ?? null,
      rootCause: data.rootCause ?? null,
      actions: data.actions ?? [],
      otherActionDetail: data.otherActionDetail ?? null,
      supplies: data.supplies ?? null,
      preventiveMeasures: data.preventiveMeasures ?? null,
    };
  }
}
