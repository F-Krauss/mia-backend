import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const plantsData = [
    {
      name: 'Planta Norte',
      location: 'León, Gto.',
      description: 'Planta norte de producción de componentes metálicos',
      processes: [
        {
          name: 'Mecanizado',
          description: 'Tornos, fresadoras y CNC',
          subprocesses: [
            { name: 'Línea A1 - Torno CNC', description: 'Torno CNC de alta precisión' },
            { name: 'Línea A2 - Fresado', description: 'Fresadoras verticales y horizontales' },
          ],
        },
        {
          name: 'Ensamble',
          description: 'Líneas de ensamble manual y semi-automático',
          subprocesses: [
            { name: 'Línea B1 - Ensamble manual', description: 'Estaciones de ensamble manual' },
            { name: 'Línea B2 - Ensamble automático', description: 'Celdas automatizadas' },
          ],
        },
        {
          name: 'Soldadura',
          description: 'Procesos MIG, TIG y robotizados',
          subprocesses: [
            { name: 'Línea C1 - Soldadura MIG', description: 'Cabinas de soldadura MIG' },
            { name: 'Línea C2 - Soldadura robotizada', description: 'Celdas con robots de soldadura' },
          ],
        },
      ],
    },
    {
      name: 'Planta Sur',
      location: 'Querétaro, Qro.',
      description: 'Planta enfocada a producción de estructuras ligeras',
      processes: [
        {
          name: 'Corte Láser',
          description: 'Corte de lámina por láser y plasma',
          subprocesses: [
            { name: 'Línea L1 - Láser fibra', description: 'Línea de corte láser de fibra' },
            { name: 'Línea L2 - Plasma', description: 'Línea de corte por plasma' },
          ],
        },
        {
          name: 'Pintura',
          description: 'Cabinas de pintura y hornos',
          subprocesses: [
            { name: 'Línea P1 - Pintura líquida', description: 'Cabina de pintura líquida' },
            { name: 'Línea P2 - Pintura en polvo', description: 'Línea de pintura electrostática' },
          ],
        },
        {
          name: 'Ensayos',
          description: 'Laboratorio de pruebas y validación',
          subprocesses: [
            { name: 'Línea E1 - Pruebas mecánicas', description: 'Fatiga, tracción, dureza' },
            { name: 'Línea E2 - Pruebas dimensionales', description: 'CMM y medición óptica' },
          ],
        },
      ],
    },
    {
      name: 'Planta Centro',
      location: 'CDMX',
      description: 'Planta de maquinado de precisión y prototipos',
      processes: [
        {
          name: 'Prototipado rápido',
          description: 'Impresión 3D y maquinado de baja serie',
          subprocesses: [
            { name: 'Línea R1 - Impresión 3D', description: 'FDM y SLA' },
            { name: 'Línea R2 - CNC prototipos', description: 'CNC 3 ejes para prototipos' },
          ],
        },
        {
          name: 'Rectificado',
          description: 'Rectificado cilíndrico y plano',
          subprocesses: [
            { name: 'Línea G1 - Rectificado cilíndrico', description: 'Rectificadoras cilíndricas' },
            { name: 'Línea G2 - Rectificado plano', description: 'Rectificadoras planas' },
          ],
        },
        {
          name: 'Metrología',
          description: 'Centro de medición de alta precisión',
          subprocesses: [
            { name: 'Línea M1 - CMM', description: 'Máquinas de medición por coordenadas' },
            { name: 'Línea M2 - Óptica', description: 'Equipos de visión y escaneo 3D' },
          ],
        },
      ],
    },
  ];

  for (const plantData of plantsData) {
    const plant = await prisma.plant.create({
      data: {
        name: plantData.name,
        location: plantData.location,
        description: plantData.description,
      },
    });

    for (const processData of plantData.processes) {
      const process = await prisma.process.create({
        data: {
          name: processData.name,
          description: processData.description,
          plantId: plant.id,
        },
      });

      for (const [index, subData] of processData.subprocesses.entries()) {
        const subprocess = await prisma.subprocess.create({
          data: {
            name: subData.name,
            description: subData.description,
            processId: process.id,
          },
        });

        // Al menos una máquina por subproceso
        await prisma.machine.create({
          data: {
            code: `${plant.name.slice(0, 2).toUpperCase()}-${process.name.slice(0, 3).toUpperCase()}-${index + 1}`,
            name: `Máquina ${subData.name}`,
            manufacturer: 'Genérico',
            model: 'Modelo-X',
            serial: `SN-${Math.floor(Math.random() * 100000)}`,
            availability: 95,
            mtbf: 100,
            mttr: 3,
            subprocessId: subprocess.id,
            processId: process.id,
          },
        });
      }
    }
  }

  console.log('✅ Seed de plantas/procesos/subprocesos/máquinas creado.');
}

main()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
