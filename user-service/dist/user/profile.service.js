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
var ProfileService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const common_1 = require("@nestjs/common");
const user_repository_1 = require("./user.repository");
let ProfileService = ProfileService_1 = class ProfileService {
    constructor(userRepository) {
        this.userRepository = userRepository;
        this.logger = new common_1.Logger(ProfileService_1.name);
    }
    async createProfile(userId, createProfileDto) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        if (user.profileId) {
            throw new common_1.BadRequestException('User already has a profile');
        }
        try {
            const profile = await this.userRepository.createProfile({
                ...createProfileDto,
                user: {
                    connect: { id: userId },
                },
            });
            await this.userRepository.updateUser(userId, {
                profile: { connect: { id: profile.id } },
            });
            return profile;
        }
        catch (error) {
            this.logger.error(`Failed to create profile: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to create profile');
        }
    }
    async getProfile(userId) {
        const profile = await this.userRepository.getUserProfile(userId);
        if (!profile) {
            throw new common_1.NotFoundException(`Profile for user ${userId} not found`);
        }
        return profile;
    }
    async updateProfile(userId, updateProfileDto) {
        const profile = await this.getProfile(userId);
        try {
            return await this.userRepository.updateProfile(profile.id, updateProfileDto);
        }
        catch (error) {
            this.logger.error(`Failed to update profile: ${error.message}`, error.stack);
            throw new common_1.BadRequestException('Failed to update profile');
        }
    }
};
exports.ProfileService = ProfileService;
exports.ProfileService = ProfileService = ProfileService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_repository_1.UserRepository])
], ProfileService);
//# sourceMappingURL=profile.service.js.map