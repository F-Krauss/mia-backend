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
        controlledDocuments: true,
        processes: {
          include: {
            controlledDocuments: true,
            machines: {
              include: {
                documents: true,
                controlledDocuments: true,
              },
            },
            subprocesses: {
              include: {
                controlledDocuments: true,
                machines: {
                  include: {
                    documents: true,
                    controlledDocuments: true,
                  },
                },
                procedures: {
                  include: {
                    documents: {
                      include: { versions: true },
                    },
                  },
                },
              },
            },
            procedures: {
              include: {
                documents: {
                  include: { versions: true },
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
    // Manual cascade to avoid FK issues when referential actions aren't migrated
    await this.prisma.$transaction(async (tx) => {
      // limpiar referencias de OT a la planta
      await tx.workOrder.updateMany({
        where: { plantId: id },
        data: { plantId: null },
      });

      // obtener procesos/subprocesos/máquinas bajo la planta
      const processes = await tx.process.findMany({
        where: { plantId: id },
        select: {
          id: true,
          machines: { select: { id: true } },
          subprocesses: {
            select: {
              id: true,
              machines: { select: { id: true } },
            },
          },
        },
      });

      const processIds = processes.map((p) => p.id);
      const subprocessIds = processes.flatMap((p) =>
        p.subprocesses.map((s) => s.id),
      );
      const machineIds = [
        ...processes.flatMap((p) => p.machines.map((m) => m.id)),
        ...processes.flatMap((p) =>
          p.subprocesses.flatMap((s) => s.machines.map((m) => m.id)),
        ),
      ];

    if (machineIds.length) {
      await tx.machineDocument.deleteMany({
        where: { machineId: { in: machineIds } },
      });
      await tx.controlledDocument.deleteMany({
        where: { machineId: { in: machineIds } },
      });
      await tx.machine.deleteMany({ where: { id: { in: machineIds } } });
    }

    if (subprocessIds.length) {
      await tx.controlledDocument.deleteMany({
        where: { subprocessId: { in: subprocessIds } },
      });
      await tx.subprocess.deleteMany({ where: { id: { in: subprocessIds } } });
    }

    if (processIds.length) {
      await tx.controlledDocument.deleteMany({
        where: { processId: { in: processIds } },
      });
      await tx.process.deleteMany({ where: { id: { in: processIds } } });
    }

    await tx.controlledDocument.deleteMany({
      where: { plantId: id },
    });

    await tx.plant.delete({ where: { id } });
  });
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
