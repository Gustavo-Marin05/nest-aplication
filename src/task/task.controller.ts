import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';


@Controller('task')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  //creacion de la tarea
  @Post()
  async create(@Body() task: CreateTaskDto, @Request()
  req) {
    return this.taskService.createService(task, req.user.id);
  }

  //obtenemos todas las tareas
  @Get()
  async findAll(@Request() req) {
    return this.taskService.findAll(req.user.id);
  }


  //obtenemos solo una tarea
  @Get(':id')
  findOne(@Param('id') id: string ,@Request() req) {
    return this.taskService.findOne(Number(id),req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskService.remove(+id);
  }
}
