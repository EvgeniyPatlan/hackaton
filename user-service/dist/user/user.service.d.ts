import { UserRepository } from './user.repository';
import { Role, User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
export declare class UserService {
    private readonly userRepository;
    private readonly logger;
    constructor(userRepository: UserRepository);
    private hashPassword;
    createUser(createUserDto: CreateUserDto): Promise<User>;
    getUser(id: string): Promise<User>;
    getUserByEmail(email: string): Promise<User>;
    updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    deleteUser(id: string): Promise<User>;
    queryUsers(queryDto: QueryUserDto): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateUserRole(id: string, role: Role): Promise<User>;
    setUserActive(id: string, isActive: boolean): Promise<User>;
    changePassword(userId: string, oldPassword: string, newPassword: string): Promise<boolean>;
    validateUserAccess(userId: string, resourceId: string, action: string): Promise<boolean>;
    getUserStats(): Promise<any>;
}
