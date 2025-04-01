import { PrismaService } from '../prisma/prisma.service';
import { File, Prisma } from '@prisma/client';
export declare class FileRepository {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    createFile(data: Prisma.FileCreateInput): Promise<File>;
    findFileById(id: string): Promise<File | null>;
    findFileByFilename(filename: string): Promise<File | null>;
    updateFile(id: string, data: Prisma.FileUpdateInput): Promise<File>;
    softDeleteFile(id: string): Promise<File>;
    hardDeleteFile(id: string): Promise<File>;
    findFiles(params: {
        skip?: number;
        take?: number;
        where?: Prisma.FileWhereInput;
        orderBy?: Prisma.FileOrderByWithRelationInput;
    }): Promise<File[]>;
    countFiles(where?: Prisma.FileWhereInput): Promise<number>;
    findFilesByLocationId(locationId: string): Promise<File[]>;
    findFilesByUserId(userId: string): Promise<File[]>;
}
