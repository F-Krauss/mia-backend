import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Injectable()
export class PlantsService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- PLANTS ----------

  async create(data: CreatePlantDto) {
    return this.prisma.plant.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        location: (data as any).location ?? null, // si tu dto no tiene location, no pasa nada
      },
    });
  }

  async findAll() {
    return this.prisma.plant.findMany({
      include: {
        // máquinas directamente bajo la planta (si las usas)
        // procesos con sus máquinas y subprocesos
        processes: {
          include: {
            machines: {
              include: {
                documents: true,
              },
            },
            subprocesses: {
              include: {
                machines: {
                  include: {
                    documents: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const plant = await this.prisma.plant.findUnique({
      where: { id },
      include: {
        processes: {
          include: {
            subprocesses: true,
          },
        },
      },
    });

    if (!plant) throw new NotFoundException('Plant not found');
    return plant;
  }

  async update(id: string, data: UpdatePlantDto) {
    return this.prisma.plant.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description ?? null,
        location: (data as any).location ?? null,
      },
    });
  }

  async remove(id: string) {
    // Ojo: para que esto borre procesos/subprocesos/máquinas, necesitas
    // que en schema.prisma las relaciones tengan onDelete: Cascade.
    await this.prisma.plant.delete({ where: { id } });
  }

  // ---------- PROCESSES ----------

  async createProcess(
    plantId: string,
    data: { name: string; description?: string },
  ) {
    return this.prisma.process.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        plant: { connect: { id: plantId } },
      },
    });
  }

  async deleteProcess(plantId: string, processId: string) {
    // Validar que el proceso pertenece a la planta
    const process = await this.prisma.process.findFirst({
      where: { id: processId, plantId },
      select: { id: true },
    });

    if (!process) {
      throw new NotFoundException('Process not found in this plant');
    }

    // Si tus relaciones en schema.prisma tienen onDelete: Cascade,
    // con esto basta y Prisma borrará subprocesos, máquinas, docs, etc.
    await this.prisma.process.delete({
      where: { id: processId },
    });
  }

  // ---------- SUBPROCESSES ----------

  async createSubprocess(
    processId: string,
    data: { name: string; description?: string },
  ) {
    return this.prisma.subprocess.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        process: { connect: { id: processId } },
      },
    });
  }

  async deleteSubprocess(
    plantId: string,
    processId: string,
    subprocessId: string,
  ) {
    // Validar que el subproceso pertenece al proceso y planta correctos
    const subprocess = await this.prisma.subprocess.findFirst({
      where: {
        id: subprocessId,
        process: {
          id: processId,
          plantId,
        },
      },
      select: { id: true },
    });

    if (!subprocess) {
      throw new NotFoundException(
        'Subprocess not found in this plant/process',
      );
    }

    // Igual: si en schema.prisma configuraste onDelete: Cascade
    // hacia máquinas y documentos, esto se lleva todo.
    await this.prisma.subprocess.delete({
      where: { id: subprocessId },
    });
  }
}
