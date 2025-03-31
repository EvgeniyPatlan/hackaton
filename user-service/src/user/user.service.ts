import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Role, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly userRepository: UserRepository) {}

  // Helper method to hash passwords
  private hashPassword(password: string): string {
    return crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    // Check if user with this email already exists
    const existingUser = await this.userRepository.findUserByEmail(email);
    if (existingUser) {
      throw new ConflictException(`User with email ${email} already exists`);
    }

    const passwordHash = this.hashPassword(password);

    try {
      return await this.userRepository.createUser({
        email,
        passwordHash,
        ...rest,
      });
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create user');
    }
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Check if user exists
    await this.getUser(id);

    // Hash password if provided
    const updates: any = { ...updateUserDto };
    if (updates.password) {
      updates.passwordHash = this.hashPassword(updates.password);
      delete updates.password;
    }

    try {
      return await this.userRepository.updateUser(id, updates);
    } catch (error) {
      this.logger.error(`Failed to update user: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update user');
    }
  }

  async deleteUser(id: string): Promise<User> {
    // Check if user exists
    await this.getUser(id);

    try {
      return await this.userRepository.deleteUser(id);
    } catch (error) {
      this.logger.error(`Failed to delete user: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete user');
    }
  }

  async queryUsers(queryDto: QueryUserDto): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, role, isActive, search } = queryDto;
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: any = {};

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
    } catch (error) {
      this.logger.error(`Failed to query users: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to query users');
    }
  }

  async updateUserRole(id: string, role: Role): Promise<User> {
    // Check if user exists
    await this.getUser(id);

    try {
      return await this.userRepository.updateUser(id, { role });
    } catch (error) {
      this.logger.error(
        `Failed to update user role: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update user role');
    }
  }

  async setUserActive(id: string, isActive: boolean): Promise<User> {
    // Check if user exists
    await this.getUser(id);

    try {
      return await this.userRepository.updateUser(id, { isActive });
    } catch (error) {
      this.logger.error(
        `Failed to update user active status: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update user active status');
    }
  }

  // Password management
  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await this.getUser(userId);

    // Verify old password
    const oldPasswordHash = this.hashPassword(oldPassword);
    if (user.passwordHash !== oldPasswordHash) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update with new password
    const newPasswordHash = this.hashPassword(newPassword);
    try {
      await this.userRepository.updateUser(userId, { passwordHash: newPasswordHash });
      return true;
    } catch (error) {
      this.logger.error(`Failed to change password: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to change password');
    }
  }

  // Additional methods for access control
  async validateUserAccess(userId: string, resourceId: string, action: string): Promise<boolean> {
    // Simple implementation - can be expanded based on specific access control needs
    const user = await this.getUser(userId);

    // Admins have full access
    if (user.role === Role.ADMIN) {
      return true;
    }

    // Moderators have access to certain actions
    if (user.role === Role.MODERATOR && ['read', 'update'].includes(action)) {
      return true;
    }

    // Regular users can only access their own resources
    if (user.role === Role.USER && userId === resourceId && ['read', 'update'].includes(action)) {
      return true;
    }

    return false;
  }

  // Method to get user statistics (for admin dashboard)
  async getUserStats(): Promise<any> {
    try {
      const [totalUsers, activeUsers, adminCount, moderatorCount] = await Promise.all([
        this.userRepository.countUsers(),
        this.userRepository.countUsers({ isActive: true }),
        this.userRepository.countUsers({ role: Role.ADMIN }),
        this.userRepository.countUsers({ role: Role.MODERATOR }),
      ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminCount,
        moderatorCount,
        regularUserCount: totalUsers - adminCount - moderatorCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get user stats: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to get user statistics');
    }
  }
}
