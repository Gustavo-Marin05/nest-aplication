import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './task.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  let prisma: any;

  const mockPrisma = {
    task: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwt = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAlltask', () => {
    it('should return all tasks for a user', async () => {
      const tasks = [
        { id: 1, title: 'Task 1', description: 'Desc', userId: 1 },
      ];
      mockPrisma.task.findMany.mockResolvedValue(tasks);

      const result = await service.getAlltask(1);

      expect(result).toEqual(tasks);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
      });
    });
  });

  describe('createTask', () => {
    it('should create and return a new task', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);
      const newTask = {
        id: 1,
        title: 'Test',
        description: 'Desc',
        userId: 1,
      };
      mockPrisma.task.create.mockResolvedValue(newTask);

      const result = await service.createTask(
        { title: 'Test', description: 'Desc' },
        1,
      );

      expect(result).toEqual(newTask);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          title: 'Test',
          description: 'Desc',
          user: { connect: { id: 1 } },
        },
      });
    });

    it('should throw if task with same title exists for user', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({ id: 1 });

      await expect(
        service.createTask({ title: 'Test', description: 'Desc' }, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTaskService', () => {
    it('should return a task if found', async () => {
      const task = { id: 1, title: 'Test', userId: 1 };
      mockPrisma.task.findFirst.mockResolvedValue(task);

      const result = await service.getTaskService(1, 1);

      expect(result).toEqual(task);
    });

    it('should throw if task not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(service.getTaskService(1, 99)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteTask', () => {
    it('should delete and return the task', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({ id: 1 });
      const deleted = { id: 1, title: 'Test', userId: 1 };
      mockPrisma.task.delete.mockResolvedValue(deleted);

      const result = await service.deleteTask(1, 1);

      expect(result).toEqual(deleted);
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw if task not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(service.deleteTask(1, 99)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateTask', () => {
    it('should update and return the task', async () => {
      mockPrisma.task.findFirst.mockResolvedValue({ id: 1 });
      const updated = { id: 1, title: 'Updated', description: 'Desc', userId: 1 };
      mockPrisma.task.update.mockResolvedValue(updated);

      const result = await service.updateTask(1, 1, { title: 'Updated' });

      expect(result).toEqual(updated);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Updated' },
      });
    });

    it('should throw if task not found', async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.updateTask(1, 99, { title: 'Updated' }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
