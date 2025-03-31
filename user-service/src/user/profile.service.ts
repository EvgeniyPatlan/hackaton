import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { Profile } from '@prisma/client';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly userRepository: UserRepository) {}

  async createProfile(
    userId: string,
    createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    // Check if user exists
    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if user already has a profile
    if (user.profileId) {
      throw new BadRequestException('User already has a profile');
    }

    try {
      // Create profile
      const profile = await this.userRepository.createProfile({
        ...createProfileDto,
        user: {
          connect: { id: userId },
        },
      });

      // Update user with profileId
      await this.userRepository.updateUser(userId, {
        profile: { connect: { id: profile.id } },
      });

      return profile;
    } catch (error) {
      this.logger.error(
        `Failed to create profile: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to create profile');
    }
  }

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.userRepository.getUserProfile(userId);
    if (!profile) {
      throw new NotFoundException(`Profile for user ${userId} not found`);
    }
    return profile;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    // Check if profile exists
    const profile = await this.getProfile(userId);

    try {
      return await this.userRepository.updateProfile(profile.id, updateProfileDto);
    } catch (error) {
      this.logger.error(
        `Failed to update profile: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to update profile');
    }
  }
}
