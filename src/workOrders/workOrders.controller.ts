import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkOrdersService } from './workOrders.service';
import { CreateWorkOrdersDto } from './dto/create-workOrders.dto';
import { UpdateWorkOrdersDto } from './dto/update-workOrders.dto';

@Controller('work-orders')
export class WorkOrdersController {
  constructor(private readonly workOrdersService: WorkOrdersService) {}

  @Post()
  create(@Body() dto: CreateWorkOrdersDto) {
    return this.workOrdersService.create(dto);
  }

  @Get()
  findAll() {
    return this.workOrdersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workOrdersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkOrdersDto) {
    return this.workOrdersService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.workOrdersService.remove(id);
    return { success: true };
  }
}
