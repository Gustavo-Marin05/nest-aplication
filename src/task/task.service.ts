import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtService } from '@nestjs/jwt';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {

    constructor(private prismaService: PrismaService, private jwrService: JwtService) { }



    async getAlltask(userId: number) {
        try {
            //console.log('userId recibido en getAlltask:', userId);
            const tasks = await this.prismaService.task.findMany({
                where: {
                    userId: userId
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



    async createTask(CreateTaskDto: CreateTaskDto, userId: number) {
        try {
            const { title, description } = CreateTaskDto;
            const taskFind = await this.prismaService.task.findFirst({
                where: {
                    title,
                    userId
                }
            });

            if (taskFind) throw new BadRequestException('esta tarea ya existe');


            //creacion de la tarea

            const task = await this.prismaService.task.create({
                data: {
                    title,
                    description,
                    user: {
                        connect: { id: userId },
                    },
                },
            });

            return task;

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new Error(error)
        }
    }


    //obtendremos solo una tarea

    async getTaskService(userId: number, taskId: number) {
        try {
            const task = await this.prismaService.task.findFirst({
                where: {
                    id: taskId,
                    userId: userId
                }
            });

            if (!task) {
                throw new BadRequestException('Tarea no encontrada');
            }

            return task;

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new Error(error)
        }
    }


    //borra todo lo de tareas
    async deleteTask(userId: number, taskId: number) {
        try {
            const tasksFound = await this.prismaService.task.findFirst({
                where: {
                    id: taskId,
                    userId: userId
                }
            })

            if (!tasksFound) throw new BadRequestException('la tarea no existe');

            const taskDelete = await this.prismaService.task.delete({
                where: {
                    id: taskId
                }
            });

            return taskDelete;

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new Error(error)
        }
    }

    async updateTask(userId: number, taskId: number, data: UpdateTaskDto) {
        try {

            const task = await this.prismaService.task.findFirst({
                where: {
                    id: taskId,
                    userId: userId,
                },
            });

            if (!task) {
                throw new BadRequestException('Tarea no encontrada');
            }

            const updatedTask = await this.prismaService.task.update({
                where: { id: taskId },
                data,
            });

            return updatedTask;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new Error(error)
        }
    }
}
