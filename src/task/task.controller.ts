import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { TaskService } from "./task.service";
import { CreateTaskDto } from "./dto/create-task.dto";

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
    async getTasks (@Request() req){
        const userId = req.user.id;
        return this.taskService.getAlltask(userId)
    }

}