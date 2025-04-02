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
var TokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const uuid_1 = require("uuid");
let TokenService = TokenService_1 = class TokenService {
    constructor(jwtService, configService, prisma, redisService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.prisma = prisma;
        this.redisService = redisService;
        this.logger = new common_1.Logger(TokenService_1.name);
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role.name,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_EXPIRES_IN', '1h'),
            secret: this.configService.get('JWT_SECRET'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            secret: this.configService.get('JWT_SECRET'),
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async saveRefreshToken(userId, refreshToken) {
        const decoded = this.jwtService.decode(refreshToken);
        const expTime = decoded.exp || Math.floor(Date.now() / 1000) + 604800;
        const expiresAt = new Date(expTime * 1000);
        await this.prisma.refreshToken.create({
            data: {
                id: (0, uuid_1.v4)(),
                token: refreshToken,
                userId,
                expiresAt,
            },
        });
        const redisKey = `refresh_token:${refreshToken}`;
        await this.redisService.set(redisKey, userId, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    }
    async verifyRefreshToken(refreshToken) {
        try {
            return this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
        }
        catch (error) {
            this.logger.error(`Error verifying refresh token: ${error.message}`);
            throw error;
        }
    }
    async findRefreshToken(refreshToken) {
        const redisKey = `refresh_token:${refreshToken}`;
        const cachedUserId = await this.redisService.get(redisKey);
        if (cachedUserId) {
            return true;
        }
        const token = await this.prisma.refreshToken.findFirst({
            where: { token: refreshToken },
        });
        return !!token;
    }
    async removeRefreshToken(refreshToken) {
        const redisKey = `refresh_token:${refreshToken}`;
        await this.redisService.del(redisKey);
        await this.prisma.refreshToken.deleteMany({
            where: { token: refreshToken },
        });
    }
    async removeAllUserTokens(userId) {
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId },
        });
        await Promise.all(tokens.map(async (token) => {
            const redisKey = `refresh_token:${token.token}`;
            return this.redisService.del(redisKey);
        }));
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }
};
exports.TokenService = TokenService;
exports.TokenService = TokenService = TokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], TokenService);
//# sourceMappingURL=token.service.js.map