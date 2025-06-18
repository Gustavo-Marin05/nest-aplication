import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TaskService {
  constructor(private prismaService: PrismaService) { }
  async createService(task: CreateTaskDto, userId: number): Promise<Task> {
    try {
      const newTask = await this.prismaService.task.create({
        data: {
          ...task,
          userId, // vincula la tarea con el usuario autenticado
        },
      });
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new BadRequestException('Error creating task');
    }

  }

  async findAll(userid: number): Promise<Task[]> {
    try {
      const tasks = await this.prismaService.task.findMany({
        where: {
          userId: userid
        }
      });
      return tasks;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(error)
    }
  }


  async findOne(idtask: number, userid: number): Promise<Task> {
    try {

      const task = await this.prismaService.task.findFirst({
        where:{
          id:idtask,
          userId:userid
        }
      })
      if(!task) throw new BadRequestException('tarea no encontrada o no existe');

      return task;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new Error(error)
    }
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
