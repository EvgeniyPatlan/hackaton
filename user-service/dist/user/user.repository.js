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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
let UserRepository = class UserRepository {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
        this.cacheExpireTime = 3600;
    }
    async findUserById(id) {
        return this.redis.getOrSet(`user:${id}`, async () => {
            return this.prisma.user.findUnique({
                where: { id },
                include: { profile: true },
            });
        }, this.cacheExpireTime);
    }
    async findUserByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
    }
    async createUser(data) {
        const user = await this.prisma.user.create({
            data,
            include: { profile: true },
        });
        await this.redis.setObject(`user:${user.id}`, user, this.cacheExpireTime);
        return user;
    }
    async updateUser(id, data) {
        const user = await this.prisma.user.update({
            where: { id },
            data,
            include: { profile: true },
        });
        await this.redis.setObject(`user:${user.id}`, user, this.cacheExpireTime);
        return user;
    }
    async deleteUser(id) {
        const user = await this.prisma.user.delete({
            where: { id },
            include: { profile: true },
        });
        await this.redis.del(`user:${user.id}`);
        return user;
    }
    async createProfile(data) {
        return this.prisma.profile.create({
            data,
        });
    }
    async updateProfile(id, data) {
        return this.prisma.profile.update({
            where: { id },
            data,
        });
    }
    async getUserProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });
        return user?.profile || null;
    }
    async findUsers(params) {
        const { skip, take, where, orderBy } = params;
        return this.prisma.user.findMany({
            skip,
            take,
            where,
            orderBy,
            include: { profile: true },
        });
    }
    async countUsers(where) {
        return this.prisma.user.count({ where });
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], UserRepository);
//# sourceMappingURL=user.repository.js.map