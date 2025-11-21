import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PlantsService } from './plants.service';
import { CreatePlantDto } from './dto/create-plant.dto';
import { UpdatePlantDto } from './dto/update-plant.dto';

@Controller('plants')
export class PlantsController {
  constructor(private readonly plantsService: PlantsService) {}

  // ---------- PLANTS ----------

  @Post()
  create(@Body() createPlantDto: CreatePlantDto) {
    return this.plantsService.create(createPlantDto);
  }

  @Get()
  findAll() {
    return this.plantsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.plantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlantDto: UpdatePlantDto,
  ) {
    return this.plantsService.update(id, updatePlantDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.plantsService.remove(id);
    return { success: true };
  }

  // ---------- PROCESSES ----------

  @Post(':plantId/processes')
  createProcess(
    @Param('plantId') plantId: string,
    @Body() body: { name: string; description?: string },
  ) {
    return this.plantsService.createProcess(plantId, body);
  }

  @Delete(':plantId/processes/:processId')
  async deleteProcess(
    @Param('plantId') plantId: string,
    @Param('processId') processId: string,
  ) {
    await this.plantsService.deleteProcess(plantId, processId);
    return { success: true };
  }

  // ---------- SUBPROCESSES ----------

  @Post(':plantId/processes/:processId/subprocesses')
  createSubprocess(
    @Param('plantId') plantId: string, // solo para validar, no se usa en el service
    @Param('processId') processId: string,
    @Body() body: { name: string; description?: string },
  ) {
    return this.plantsService.createSubprocess(processId, body);
  }

  @Delete(':plantId/processes/:processId/subprocesses/:subprocessId')
  async deleteSubprocess(
    @Param('plantId') plantId: string,
    @Param('processId') processId: string,
    @Param('subprocessId') subprocessId: string,
  ) {
    await this.plantsService.deleteSubprocess(plantId, processId, subprocessId);
    return { success: true };
  }
}
