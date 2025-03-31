import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ProfileService } from './profile.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    // Remove sensitive information
    delete user.passwordHash;
    return user;
  }

  @Get()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUsers(@Query() queryDto: QueryUserDto) {
    const result = await this.userService.queryUsers(queryDto);
    // Remove sensitive information
    result.users.forEach(user => delete user.passwordHash);
    return result;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUser(id);
    // Remove sensitive information
    delete user.passwordHash;
    return user;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(id, updateUserDto);
    // Remove sensitive information
    delete user.passwordHash;
    return user;
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    await this.userService.deleteUser(id);
  }

  @Post(':id/profile')
  @UseGuards(JwtAuthGuard)
  async createProfile(
    @Param('id') id: string,
    @Body() createProfileDto: CreateProfileDto,
  ) {
    return this.profileService.createProfile(id, createProfileDto);
  }

  @Get(':id/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('id') id: string) {
    return this.profileService.getProfile(id);
  }

  @Put(':id/profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(id, updateProfileDto);
  }

  @Put(':id/role')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: Role,
  ) {
    const user = await this.userService.updateUserRole(id, role);
    // Remove sensitive information
    delete user.passwordHash;
    return user;
  }

  @Put(':id/active')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async setActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    const user = await this.userService.setUserActive(id, isActive);
    // Remove sensitive information
    delete user.passwordHash;
    return user;
  }
}
