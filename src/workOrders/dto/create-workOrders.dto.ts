export type WorkOrderStatus =
  | 'unassigned'
  | 'assigned'
  | 'in_progress'
  | 'on_hold'
  | 'testing'
  | 'closed'
  | 'cancelled';

export type WorkOrderPriority = 'P1' | 'P2' | 'P3';
export type RiskLevel = 'Bajo' | 'Medio' | 'Alto';
export type AiMatch = 'yes' | 'no';

export class WorkOrderLogDto {
  date: string | Date;
  action: string;
  user: string;
  comment?: string;
}

export class WorkOrderAiDataDto {
  classification: string;
  priority: WorkOrderPriority;
  riskLevel: RiskLevel;
  productionImpact: string;
  qualityImpact: boolean;
  operatorInstructions: string;
  rootCauses: { cause: string; probability: string }[];
  suggestedActions: string[];
}

export class TechnicalReportDto {
  inspections?: string;
  measurements?: string;
  diagnosis?: string;
  aiMatch?: AiMatch | null;
  rootCause?: string;
  actions?: string[];
  otherActionDetail?: string;
  supplies?: string;
  preventiveMeasures?: string;
}

export class CreateWorkOrdersDto {
  otNumber: string;

  plantId?: string;
  plantName: string;
  processId?: string;
  processName: string;
  subprocessId?: string;
  subprocessName: string;
  machineId?: string;
  machineCode: string;
  machineName: string;

  reportDate: string | Date;
  detectorName: string;
  shift: string;
  requestType: string;
  machineStatus: string;
  description: string;
  symptoms: string[];

  aiData?: WorkOrderAiDataDto;
  technicalReport?: TechnicalReportDto;

  status: WorkOrderStatus;
  assignedTo?: string;
  slaTarget: string | Date;
  startedAt?: string | Date | null;
  closedAt?: string | Date | null;
  logs?: WorkOrderLogDto[];
}
