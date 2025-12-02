import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { AiQueriesService } from './ai-queries.service';
import { CreateAIQueryDto } from './dto/create-ai-query.dto';

@Controller('ai-queries')
export class AiQueriesController {
  constructor(private readonly aiQueriesService: AiQueriesService) {}

  @Post()
  create(@Body() createAIQueryDto: CreateAIQueryDto) {
    return this.aiQueriesService.create(createAIQueryDto);
  }

  @Get()
  findAll() {
    return this.aiQueriesService.findAll();
  }

  @Get('recent')
  findRecent() {
    return this.aiQueriesService.findRecent();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiQueriesService.findOne(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.aiQueriesService.delete(id);
  }
}
