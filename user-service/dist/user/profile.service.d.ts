import { UserRepository } from './user.repository';
import { Profile } from '@prisma/client';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class ProfileService {
    private readonly userRepository;
    private readonly logger;
    constructor(userRepository: UserRepository);
    createProfile(userId: string, createProfileDto: CreateProfileDto): Promise<Profile>;
    getProfile(userId: string): Promise<Profile>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Profile>;
}
