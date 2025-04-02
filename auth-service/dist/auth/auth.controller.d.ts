import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
interface RequestUser {
    id: string;
    [key: string]: any;
}
interface RequestWithUser extends ExpressRequest {
    user?: RequestUser;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(req: RequestWithUser, loginDto: LoginDto): Promise<AuthResponseDto>;
    register(registerDto: RegisterDto): Promise<AuthResponseDto>;
    logout(req: RequestWithUser): Promise<{
        message: string;
    }>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    getProfile(req: RequestWithUser): Promise<any>;
}
export {};
