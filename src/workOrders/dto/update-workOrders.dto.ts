import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkOrdersDto } from './create-workOrders.dto';

export class UpdateWorkOrdersDto extends PartialType(CreateWorkOrdersDto) {}
