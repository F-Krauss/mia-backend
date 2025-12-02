const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== ControlledDocuments ===');
  const controlled = await prisma.controlledDocument.findMany({ take: 5 });
  controlled.forEach(d => {
    console.log(`${d.code} - ${d.name}`);
    console.log(`  fileUrl: ${d.fileUrl || 'NULL'}`);
    console.log(`  fileBase64: ${d.fileBase64 ? 'HAS_DATA (' + d.fileBase64.length + ' chars)' : 'NULL'}`);
  });

  console.log('\n=== ProcedureDocuments ===');
  const procDocs = await prisma.procedureDocument.findMany({ 
    take: 5,
    include: { versions: true }
  });
  procDocs.forEach(d => {
    console.log(`${d.code} - ${d.name}`);
    d.versions.forEach(v => {
      console.log(`  v${v.version}: fileUrl=${v.fileUrl || 'NULL'}, fileBase64=${v.fileBase64 ? 'HAS_DATA' : 'NULL'}`);
    });
  });

  console.log('\n=== MachineDocuments ===');
  const machineDocs = await prisma.machineDocument.findMany({ take: 5 });
  machineDocs.forEach(d => {
    console.log(`${d.name}`);
    console.log(`  base64Data: ${d.base64Data ? 'HAS_DATA (' + d.base64Data.length + ' chars)' : 'NULL'}`);
    console.log(`  filePath: ${d.filePath || 'NULL'}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
