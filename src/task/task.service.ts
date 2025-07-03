import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class TaskService {

    constructor(private prismaService: PrismaService, private jwrService: JwtService) { }



    async getAlltask(userId: number) {
        try {
            //console.log('userId recibido en getAlltask:', userId);
            const tasks =await this.prismaService.task.findMany({
                where:{
                    userId:userId
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

    updateTask() {
        return 'aqui se modifico una tarea'
    }

    deleteTask() {
        return 'se borro la tarea'
    }
}
