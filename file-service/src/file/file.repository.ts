import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { File, Prisma, FileStatus } from '@prisma/client';

@Injectable()
export class FileRepository {
  private readonly logger = new Logger(FileRepository.name);

  constructor(private prisma: PrismaService) {}

  async createFile(data: Prisma.FileCreateInput): Promise<File> {
    return this.prisma.file.create({
      data,
    });
  }

  async findFileById(id: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }

  async findFileByFilename(filename: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { filename },
    });
  }

  async updateFile(id: string, data: Prisma.FileUpdateInput): Promise<File> {
    return this.prisma.file.update({
      where: { id },
      data,
    });
  }

  async softDeleteFile(id: string): Promise<File> {
    return this.prisma.file.update({
      where: { id },
      data: { status: FileStatus.DELETED },
    });
  }

  async hardDeleteFile(id: string): Promise<File> {
    return this.prisma.file.delete({
      where: { id },
    });
  }

  async findFiles(params: {
    skip?: number;
    take?: number;
    where?: Prisma.FileWhereInput;
    orderBy?: Prisma.FileOrderByWithRelationInput;
  }): Promise<File[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.file.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  async countFiles(where?: Prisma.FileWhereInput): Promise<number> {
    return this.prisma.file.count({ where });
  }

  async findFilesByLocationId(locationId: string): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        locationId,
        status: FileStatus.ACTIVE,
      },
    });
  }

  async findFilesByUserId(userId: string): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        userId,
        status: FileStatus.ACTIVE,
      },
    });
  }
}
