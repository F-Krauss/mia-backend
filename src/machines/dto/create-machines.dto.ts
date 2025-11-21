// src/machines/dto/create-machine.dto.ts
export class CreateMachineDto {
  code: string;
  name: string;
  manufacturer: string;
  model: string;
  serial: string;

  availability?: number;
  mtbf?: number;
  mttr?: number;
  totalOts?: number;
  openOts?: number;

  processId?: string;
  subprocessId?: string;
}
