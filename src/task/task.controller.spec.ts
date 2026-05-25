import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { AuthGuard } from 'src/auth/guard/auth.guard';

describe('TaskController', () => {
  let controller: TaskController;

  const mockTaskService = {
    createTask: jest.fn(),
    getAlltask: jest.fn(),
    getTaskService: jest.fn(),
    deleteTask: jest.fn(),
    updateTask: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [{ provide: TaskService, useValue: mockTaskService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /task', () => {
    it('should create a task', async () => {
      mockTaskService.createTask.mockResolvedValue({ id: 1 });
      const req = { user: { id: 1 } };

      const result = await controller.createTask(
        { title: 'Test', description: 'Desc' },
        req,
      );

      expect(result).toEqual({ id: 1 });
      expect(mockTaskService.createTask).toHaveBeenCalledWith(
        { title: 'Test', description: 'Desc' },
        1,
      );
    });
  });

  describe('GET /task', () => {
    it('should return all tasks for user', async () => {
      mockTaskService.getAlltask.mockResolvedValue([{ id: 1 }]);
      const req = { user: { id: 1 } };

      const result = await controller.getTasks(req);

      expect(result).toEqual([{ id: 1 }]);
      expect(mockTaskService.getAlltask).toHaveBeenCalledWith(1);
    });
  });

  describe('GET /task/:id', () => {
    it('should return task by id', async () => {
      mockTaskService.getTaskService.mockResolvedValue({ id: 1 });
      const req = { user: { id: 1 } };

      const result = await controller.getTask(req, '1');

      expect(result).toEqual({ id: 1 });
      expect(mockTaskService.getTaskService).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('DELETE /task/:id', () => {
    it('should delete a task', async () => {
      mockTaskService.deleteTask.mockResolvedValue({ id: 1 });
      const req = { user: { id: 1 } };

      const result = await controller.deleteTask(req, '1');

      expect(result).toEqual({ id: 1 });
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('PUT /task/:id', () => {
    it('should update a task', async () => {
      mockTaskService.updateTask.mockResolvedValue({ id: 1, title: 'U' });
      const req = { user: { id: 1 } };

      const result = await controller.updateTask(req, '1', { title: 'U' });

      expect(result).toEqual({ id: 1, title: 'U' });
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(1, 1, {
        title: 'U',
      });
    });
  });
});
