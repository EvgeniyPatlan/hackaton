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
var UserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("./user.repository");
const client_1 = require("@prisma/client");
const crypto = require("crypto");
let UserService = UserService_1 = class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(UserService_1.name);
    }
    hashPassword(password) {
        return crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
    }
    async createUser(createUserDto) {
        const { email, password, ...rest } = createUserDto;
        const existingUser = await this.userRepository.findUserByEmail(email);
        if (existingUser) {
            throw new common_1.ConflictException(`User with email ${email} already exists`);
        }
        const passwordHash = this.hashPassword(password);
        try {
            return await this.userRepository.createUser({
                email,
                passwordHash,
                ...rest,
            });
        }
        catch (error) {
            this.logger.error(`Failed to create user: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to create user');
        }
    }
    async getUser(id) {
        const user = await this.userRepository.findUserById(id);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async getUserByEmail(email) {
        const user = await this.userRepository.findUserByEmail(email);
        if (!user) {
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        }
        return user;
    }
    async updateUser(id, updateUserDto) {
        await this.getUser(id);
        const updates = { ...updateUserDto };
        if (updates.password) {
            updates.passwordHash = this.hashPassword(updates.password);
            delete updates.password;
        }
        try {
            return await this.userRepository.updateUser(id, updates);
        }
        catch (error) {
            this.logger.error(`Failed to update user: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to update user');
        }
    }
    async deleteUser(id) {
        await this.getUser(id);
        try {
            return await this.userRepository.deleteUser(id);
        }
        catch (error) {
            this.logger.error(`Failed to delete user: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to delete user');
        }
    }
    async queryUsers(queryDto) {
        const { page = 1, limit = 10, role, isActive, search } = queryDto;
        const skip = (page - 1) * limit;
        const where = {};
        if (role) {
            where.role = role;
        }
        if (isActive !== undefined) {
            where.isActive = isActive;
        }
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }
        try {
            const [users, total] = await Promise.all([
                this.userRepository.findUsers({
                    skip,
                    take: limit,
                    where,
                    orderBy: { createdAt: 'desc' },
                }),
                this.userRepository.countUsers(where),
            ]);
            return {
                users,
                total,
                page,
                limit,
            };
        }
        catch (error) {
            this.logger.error(`Failed to query users: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to query users');
        }
    }
    async updateUserRole(id, role) {
        await this.getUser(id);
        try {
            return await this.userRepository.updateUser(id, { role });
        }
        catch (error) {
            this.logger.error(`Failed to update user role: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to update user role');
        }
    }
    async setUserActive(id, isActive) {
        await this.getUser(id);
        try {
            return await this.userRepository.updateUser(id, { isActive });
        }
        catch (error) {
            this.logger.error(`Failed to update user active status: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to update user active status');
        }
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.getUser(userId);
        const oldPasswordHash = this.hashPassword(oldPassword);
        if (user.passwordHash !== oldPasswordHash) {
            throw new common_1.BadRequestException('Current password is incorrect');
        }
        const newPasswordHash = this.hashPassword(newPassword);
        try {
            await this.userRepository.updateUser(userId, { passwordHash: newPasswordHash });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to change password: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to change password');
        }
    }
    async validateUserAccess(userId, resourceId, action) {
        const user = await this.getUser(userId);
        if (user.role === client_1.Role.ADMIN) {
            return true;
        }
        if (user.role === client_1.Role.MODERATOR && ['read', 'update'].includes(action)) {
            return true;
        }
        if (user.role === client_1.Role.USER && userId === resourceId && ['read', 'update'].includes(action)) {
            return true;
        }
        return false;
    }
    async getUserStats() {
        try {
            const [totalUsers, activeUsers, adminCount, moderatorCount] = await Promise.all([
                this.userRepository.countUsers(),
                this.userRepository.countUsers({ isActive: true }),
                this.userRepository.countUsers({ role: client_1.Role.ADMIN }),
                this.userRepository.countUsers({ role: client_1.Role.MODERATOR }),
            ]);
            return {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                adminCount,
                moderatorCount,
                regularUserCount: totalUsers - adminCount - moderatorCount,
            };
        }
        catch (error) {
            this.logger.error(`Failed to get user stats: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to get user statistics');
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = UserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], UserService);
//# sourceMappingURL=user.service.js.map