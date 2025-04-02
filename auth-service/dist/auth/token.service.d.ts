import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
interface UserWithRole {
    id: string;
    email: string;
    role: {
        name: string;
    };
}
interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    exp?: number;
}
export declare class TokenService {
    private readonly jwtService;
    private readonly configService;
    private readonly prisma;
    private readonly redisService;
    private readonly logger;
    constructor(jwtService: JwtService, configService: ConfigService, prisma: PrismaService, redisService: RedisService);
    generateTokens(user: UserWithRole): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    saveRefreshToken(userId: string, refreshToken: string): Promise<void>;
    verifyRefreshToken(refreshToken: string): Promise<JwtPayload>;
    findRefreshToken(refreshToken: string): Promise<boolean>;
    removeRefreshToken(refreshToken: string): Promise<void>;
    removeAllUserTokens(userId: string): Promise<void>;
}
export {};
