import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";

@Controller('task')
@UseGuards(AuthGuard)

export class TaskController {

    constructor(private readonly taskService: TaskService) { }
    @Post()
    async createTask(@Body() createTaskDto: CreateTaskDto, @Request() req) {
        const userId = req.user.id;
        return this.taskService.createTask(createTaskDto, userId);
    }


    @Get()
    async getTasks(@Request() req) {
        const userId = req.user.id;
        return this.taskService.getAlltask(userId)
    }


    @Get(':id')
    async getTask(@Request() req, @Param('id') id: string) {
        const userId = req.user.id;
        const taskId = parseInt(id);
        return this.taskService.getTaskService(userId, taskId)
    }


    //borra la tarea

    @Delete(':id')
    async deleteTask(@Request() req, @Param('id') id: string) {
        const userId = req.user.id;
        const taskId = parseInt(id);
        return this.taskService.deleteTask(userId, taskId)

    }

    @Put(':id')
    async updateTask(@Request() req,
        @Param('id') id: string,
        @Body() updateData: UpdateTaskDto) {
        const userId = req.user.id;
        const taskId = parseInt(id);
        return this.taskService.updateTask(userId, taskId,updateData)

    }

}