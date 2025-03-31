import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Profile, Prisma } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class UserRepository {
  private readonly cacheExpireTime = 3600; // 1 hour

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findUserById(id: string): Promise<User | null> {
    return this.redis.getOrSet(
      `user:${id}`,
      async () => {
        return this.prisma.user.findUnique({
          where: { id },
          include: { profile: true },
        });
      },
      this.cacheExpireTime,
    );
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prisma.user.create({
      data,
      include: { profile: true },
    });
    await this.redis.setObject(`user:${user.id}`, user, this.cacheExpireTime);
    return user;
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data,
      include: { profile: true },
    });
    await this.redis.setObject(`user:${user.id}`, user, this.cacheExpireTime);
    return user;
  }

  async deleteUser(id: string): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { profile: true },
    });
    await this.redis.del(`user:${user.id}`);
    return user;
  }

  async createProfile(
    data: Prisma.ProfileCreateInput,
  ): Promise<Profile> {
    return this.prisma.profile.create({
      data,
    });
  }

  async updateProfile(
    id: string,
    data: Prisma.ProfileUpdateInput,
  ): Promise<Profile> {
    return this.prisma.profile.update({
      where: { id },
      data,
    });
  }

  async getUserProfile(userId: string): Promise<Profile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    return user?.profile || null;
  }

  async findUsers(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      include: { profile: true },
    });
  }

  async countUsers(where?: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({ where });
  }
}
