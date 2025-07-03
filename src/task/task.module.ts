import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';


@Module({
    imports: [
        PrismaModule,
        JwtModule
    ],
    controllers: [TaskController],
    providers: [TaskService]
})
export class TaskModule { }
