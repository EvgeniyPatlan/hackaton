import { Role } from '@prisma/client';
export declare class QueryUserDto {
    page?: number;
    limit?: number;
    role?: Role;
    isActive?: boolean;
    search?: string;
}
