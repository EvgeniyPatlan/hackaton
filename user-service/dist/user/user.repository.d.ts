import { PrismaService } from '../prisma/prisma.service';
import { User, Profile, Prisma } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
export declare class UserRepository {
    private prisma;
    private redis;
    private readonly cacheExpireTime;
    constructor(prisma: PrismaService, redis: RedisService);
    findUserById(id: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User>;
    deleteUser(id: string): Promise<User>;
    createProfile(data: Prisma.ProfileCreateInput): Promise<Profile>;
    updateProfile(id: string, data: Prisma.ProfileUpdateInput): Promise<Profile>;
    getUserProfile(userId: string): Promise<Profile | null>;
    findUsers(params: {
        skip?: number;
        take?: number;
        where?: Prisma.UserWhereInput;
        orderBy?: Prisma.UserOrderByWithRelationInput;
    }): Promise<User[]>;
    countUsers(where?: Prisma.UserWhereInput): Promise<number>;
}
