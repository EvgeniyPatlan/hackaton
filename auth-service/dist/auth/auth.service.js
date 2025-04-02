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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const token_service_1 = require("./token.service");
const bcrypt = require("bcrypt");
let AuthService = AuthService_1 = class AuthService {
    constructor(prisma, tokenService, configService) {
        this.prisma = prisma;
        this.tokenService = tokenService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async validateUser(email, password) {
        const user = await this.prisma.$queryRaw `
      SELECT u.*, r.* 
      FROM "users" u
      JOIN "roles" r ON u."role_id" = r.id
      WHERE u.email = ${email}
      LIMIT 1
    `;
        if (!user || user.length === 0) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const userFound = user[0];
        if (!userFound.isActive) {
            throw new common_1.UnauthorizedException('User account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(password, userFound.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { passwordHash, ...result } = userFound;
        return result;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        await this.prisma.$executeRaw `
      UPDATE "users" 
      SET "last_login_at" = NOW() 
      WHERE id = ${user.id}
    `;
        const { accessToken, refreshToken } = await this.tokenService.generateTokens(user);
        await this.tokenService.saveRefreshToken(user.id, refreshToken);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role.name,
                permissions: user.role.permissions,
            },
        };
    }
    async register(registerDto) {
        const existingUsers = await this.prisma.$queryRaw `
      SELECT id FROM "users" WHERE email = ${registerDto.email} LIMIT 1
    `;
        if (existingUsers && existingUsers.length > 0) {
            throw new common_1.BadRequestException('User with this email already exists');
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);
        const roles = await this.prisma.$queryRaw `
      SELECT id, name, permissions FROM "roles" WHERE name = 'user' LIMIT 1
    `;
        if (!roles || roles.length === 0) {
            throw new common_1.BadRequestException('Default role not found');
        }
        const role = roles[0];
        const newUser = await this.prisma.$transaction(async (prisma) => {
            const user = await prisma.$executeRaw `
        INSERT INTO "users" (
          id, email, password_hash, full_name, phone, role_id, verification_status, created_at, updated_at, is_active
        ) VALUES (
          gen_random_uuid(), ${registerDto.email}, ${passwordHash}, ${registerDto.fullName}, 
          ${registerDto.phone}, ${role.id}, 'unverified', NOW(), NOW(), true
        )
        RETURNING id, email, full_name, verification_status, role_id
      `;
            const createdUsers = await prisma.$queryRaw `
        SELECT u.*, r.* 
        FROM "users" u
        JOIN "roles" r ON u."role_id" = r.id
        WHERE u.email = ${registerDto.email}
        LIMIT 1
      `;
            return createdUsers[0];
        });
        const { accessToken, refreshToken } = await this.tokenService.generateTokens({
            id: newUser.id,
            email: newUser.email,
            role: {
                name: role.name
            }
        });
        await this.tokenService.saveRefreshToken(newUser.id, refreshToken);
        return {
            accessToken,
            refreshToken,
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.fullName,
                role: role.name,
                permissions: role.permissions,
            },
        };
    }
    async logout(userId) {
        await this.tokenService.removeAllUserTokens(userId);
    }
    async refreshTokens(refreshToken) {
        try {
            const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
            const tokenExists = await this.tokenService.findRefreshToken(refreshToken);
            if (!tokenExists) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const users = await this.prisma.$queryRaw `
        SELECT u.*, r.* 
        FROM "users" u
        JOIN "roles" r ON u."role_id" = r.id
        WHERE u.id = ${decoded.sub}
        LIMIT 1
      `;
            if (!users || users.length === 0 || !users[0].isActive) {
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            const user = users[0];
            await this.tokenService.removeRefreshToken(refreshToken);
            const tokens = await this.tokenService.generateTokens({
                id: user.id,
                email: user.email,
                role: {
                    name: user.role.name
                }
            });
            await this.tokenService.saveRefreshToken(user.id, tokens.refreshToken);
            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName,
                    role: user.role.name,
                    permissions: user.role.permissions,
                },
            };
        }
        catch (error) {
            this.logger.error(`Error refreshing tokens: ${error.message}`);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        token_service_1.TokenService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map