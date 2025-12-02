const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the MachineDocument that has the PDF
  const machineDoc = await prisma.machineDocument.findFirst({
    where: { name: 'Fagor-CNC-8037-Programming-Manual-Spanish1.pdf' }
  });

  if (!machineDoc || !machineDoc.base64Data) {
    console.log('No MachineDocument found with that name and base64Data');
    return;
  }

  console.log('Found MachineDocument with base64Data, length:', machineDoc.base64Data.length);

  // Find the ControlledDocument that needs the file
  const controlledDoc = await prisma.controlledDocument.findFirst({
    where: { code: 'ts13' }
  });

  if (!controlledDoc) {
    console.log('No ControlledDocument found with code ts13');
    return;
  }

  console.log('Found ControlledDocument:', controlledDoc.id, controlledDoc.name);

  // Update with the base64 data
  await prisma.controlledDocument.update({
    where: { id: controlledDoc.id },
    data: { 
      fileBase64: machineDoc.base64Data,
      fileName: machineDoc.name
    }
  });

  console.log('Updated ControlledDocument with fileBase64!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
