"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FileRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let FileRepository = FileRepository_1 = class FileRepository {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FileRepository_1.name);
    }
    async createFile(data) {
        return this.prisma.file.create({
            data,
        });
    }
    async findFileById(id) {
        return this.prisma.file.findUnique({
            where: { id },
        });
    }
    async findFileByFilename(filename) {
        return this.prisma.file.findUnique({
            where: { filename },
        });
    }
    async updateFile(id, data) {
        return this.prisma.file.update({
            where: { id },
            data,
        });
    }
    async softDeleteFile(id) {
        return this.prisma.file.update({
            where: { id },
            data: { status: client_1.FileStatus.DELETED },
        });
    }
    async hardDeleteFile(id) {
        return this.prisma.file.delete({
            where: { id },
        });
    }
    async findFiles(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.file.findMany({
            skip,
            take,
            where,
            orderBy,
        });
    }
    async countFiles(where) {
        return this.prisma.file.count({ where });
    }
    async findFilesByLocationId(locationId) {
        return this.prisma.file.findMany({
            where: {
                locationId,
                status: client_1.FileStatus.ACTIVE,
            },
        });
    }
    async findFilesByUserId(userId) {
        return this.prisma.file.findMany({
            where: {
                userId,
                status: client_1.FileStatus.ACTIVE,
            },
        });
    }
};
exports.FileRepository = FileRepository;
exports.FileRepository = FileRepository = FileRepository_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FileRepository);
//# sourceMappingURL=file.repository.js.map